# Classical Channel Template

A curated classical music listening experience, packaged as a retro TV web app.

The application source contains no recordings or personal playlist. Supply a JSON playlist to use the existing player, channels, notes, and shuffle controls.

## Run

```sh
npm ci
npm run dev
```

The default `/playlist.json` contains an empty `tracks` array. Add recordings you intend to serve there, or copy `.env.example` to `.env.local` and set `VITE_PLAYLIST_URL` to your own JSON URL. A remote playlist must permit cross-origin reads. Playlist requests omit cookies.

For local-only configuration, use `VITE_PLAYLIST_URL=/playlist.local.json` in `.env.local` and put your playlist in `public/playlist.local.json`. Both are ignored by Git. Local media can live under the ignored `public/media-local/` directory. Vite publishes files under `public/`, and `VITE_` variables are visible to visitors; these inputs are for playable content, never credentials or private archives.

## Playlist format

```json
{
  "tracks": [
    {
      "title": "Example recording",
      "composer": "Example composer",
      "performer": "Example performer",
      "videoUrl": "./media/recording.mp4",
      "notes": "Notes about the recording."
    }
  ]
}
```

This is a schema example; no media file is included. `videoUrl` may be an absolute HTTP(S) URL or a path relative to the playlist JSON. Alternatively, supply an 11-character `youtubeId` for an embedded video. `title` and at least one media source are required. Optional fields include `arrangement`, `crop` (`top`, `left`, `width`, `height` as percentages), and `videoFit` (`width`, `height`, `objectFit`). A bare array of tracks is also accepted. Invalid/unavailable input leaves the player empty with a short status message.

The optional ingest helper in `.agents/skills/classical-track-ingest/` takes your bucket/public-media URL explicitly; it has no production defaults.

## Check

```sh
npm test
npm run build
npm run lint
```

Tests and the production build pass. The inherited UI currently has two lint
findings: an unused debug setter in `TV.jsx` and an effect-driven state reset in
`useNowPlaying.js`. They are unchanged in this source export.
