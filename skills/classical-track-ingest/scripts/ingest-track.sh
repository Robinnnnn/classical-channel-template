#!/usr/bin/env bash
set -euo pipefail

URL=""
SLUG=""
START=""
END=""
TMP_DIR=".tmp"
BUCKET="${R2_BUCKET:-}"
R2_BASE="${R2_PUBLIC_BASE_URL:-}"
SCALE="1280:720"
CRF="25"
MAX_FPS="30"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url) URL="$2"; shift 2 ;;
    --slug) SLUG="$2"; shift 2 ;;
    --start) START="$2"; shift 2 ;;
    --end) END="$2"; shift 2 ;;
    --tmp-dir) TMP_DIR="$2"; shift 2 ;;
    --bucket) BUCKET="$2"; shift 2 ;;
    --r2-base) R2_BASE="$2"; shift 2 ;;
    --scale) SCALE="$2"; shift 2 ;;
    --crf) CRF="$2"; shift 2 ;;
    --max-fps) MAX_FPS="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$URL" || -z "$SLUG" || -z "$BUCKET" || -z "$R2_BASE" ]]; then
  echo "Usage: $0 --url <youtube-url> --slug <kebab-name> [--start HH:MM:SS] [--end HH:MM:SS] --bucket <your-bucket> --r2-base <your-public-media-url> [--crf 25] [--max-fps 30]" >&2
  exit 1
fi

if [[ ! "$SLUG" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "--slug must use lowercase letters/numbers separated by hyphens" >&2
  exit 1
fi
R2_BASE_PATTERN='^https://[A-Za-z0-9.-]+(:[0-9]+)?(/[-A-Za-z0-9._~%]*)*$'
if [[ ! "$R2_BASE" =~ $R2_BASE_PATTERN ]]; then
  echo "--r2-base must be an HTTPS public-media origin/path without credentials or a query" >&2
  exit 1
fi
R2_BASE="${R2_BASE%/}"

command -v yt-dlp >/dev/null || { echo "yt-dlp is required" >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg is required" >&2; exit 1; }
command -v ffprobe >/dev/null || { echo "ffprobe is required" >&2; exit 1; }
command -v wrangler >/dev/null || { echo "wrangler is required" >&2; exit 1; }

mkdir -p "$TMP_DIR"

YOUTUBE_ID="$(yt-dlp --print "%(id)s" "$URL" | tail -n1)"
SOURCE_FILE="$TMP_DIR/$YOUTUBE_ID.mp4"
OUT_FILE="$TMP_DIR/$SLUG.mp4"
OBJECT_KEY="$SLUG.mp4"

yt-dlp -f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b" -o "$TMP_DIR/%(id)s.%(ext)s" "$URL"

SRC_FPS_RAW="$(ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate -of default=nw=1:nk=1 "$SOURCE_FILE")"
SRC_FPS="$(awk -F'/' '{ if ($2 == 0) print 0; else printf "%.3f", $1/$2 }' <<<"$SRC_FPS_RAW")"

FFMPEG_ARGS=( -y )
if [[ -n "$START" ]]; then
  FFMPEG_ARGS+=( -ss "$START" )
fi
if [[ -n "$END" ]]; then
  FFMPEG_ARGS+=( -to "$END" )
fi
FFMPEG_ARGS+=(
  -i "$SOURCE_FILE"
  -vf "scale=$SCALE"
)

if awk "BEGIN {exit !($SRC_FPS > $MAX_FPS)}"; then
  FFMPEG_ARGS+=( -r "$MAX_FPS" )
fi

FFMPEG_ARGS+=(
  -c:v libx264
  -preset medium
  -crf "$CRF"
  -pix_fmt yuv420p
  -movflags +faststart
  -c:a aac
  -b:a 128k
  "$OUT_FILE"
)

ffmpeg "${FFMPEG_ARGS[@]}"

wrangler r2 object put "$BUCKET/$OBJECT_KEY" --file "$OUT_FILE" --content-type video/mp4 --remote

DURATION="$(ffprobe -v error -show_entries format=duration -of default=nw=1 "$OUT_FILE" | cut -d= -f2)"
VIDEO_URL="$R2_BASE/$OBJECT_KEY"

echo ""
echo "✅ ingest complete"
echo "youtubeId: $YOUTUBE_ID"
echo "objectKey: $OBJECT_KEY"
echo "videoUrl: $VIDEO_URL"
echo "durationSec: $DURATION"
echo "encode: h264/aac scale=$SCALE crf=$CRF maxFps=$MAX_FPS sourceFps=$SRC_FPS"
echo ""
echo "PLAYLIST_ENTRY (add inside the tracks array of your configured JSON playlist):"
printf '{\n  "title": "Example recording",\n  "composer": "",\n  "performer": "",\n  "youtubeId": "%s",\n  "videoUrl": "%s",\n  "notes": ""\n}\n' "$YOUTUBE_ID" "$VIDEO_URL"
