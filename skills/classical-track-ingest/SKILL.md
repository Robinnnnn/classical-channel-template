---
name: classical-track-ingest
description: Prepare a performance clip with standard encoding, upload to an explicitly configured R2 bucket, and return a JSON entry for a Classical Channel playlist.
---

# Classical Track Ingest

Run the helper with the user's chosen media source, bucket, and public-media URL. There are no production defaults:

```bash
skills/classical-track-ingest/scripts/ingest-track.sh \
  --url "<source-url>" \
  --slug "example-recording" \
  --bucket "<your-r2-bucket>" \
  --r2-base "https://media.example.com" \
  --start "00:00:06" \
  --end "00:03:04"
```

`R2_BUCKET` and `R2_PUBLIC_BASE_URL` may supply the same values from the shell. Keep account-specific values and credentials outside tracked source. This helper uploads a public-facing clip using authenticated Wrangler; run it only when ingest/upload is requested.

Encoding uses H.264 + AAC, 1280×720, CRF 25, fast start, and a 30fps cap only when the source exceeds it. Temporary media stays under ignored `.tmp/`.

The script prints a JSON object. Add it inside the `tracks` array of the configured playlist, with title, composer, performer, optional arrangement, and notes. The app loads `/playlist.json` by default; an ignored `.env.local` can select another URL via `VITE_PLAYLIST_URL`. Do not embed a personal catalog or production media host in application source.

Respect requested clip boundaries. Run `npm test` and `npm run build` after playlist or player changes. Keep temporary files, local state, credentials, and local-only playlists out of commits.
