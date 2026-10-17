// The playlist is deployment input, not a catalog embedded in the app source.
const TEXT_FIELDS = ['title', 'composer', 'performer', 'arrangement', 'notes']

function mediaUrl(value, baseUrl, path) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${path} must be a media URL`)
  const url = new URL(value, baseUrl)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error(`${path} must use HTTP(S) without embedded credentials`)
  }
  return url.href
}

export function parsePlaylist(input, baseUrl) {
  const rows = Array.isArray(input) ? input : input?.tracks
  if (!Array.isArray(rows)) throw new Error('Playlist must be an array or an object with a tracks array')
  return rows.map((row, index) => {
    const path = `tracks[${index}]`
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${path} must be an object`)
    const track = {}
    for (const field of TEXT_FIELDS) {
      if (row[field] !== undefined && typeof row[field] !== 'string') throw new Error(`${path}.${field} must be text`)
      track[field] = row[field]?.trim() ?? ''
    }
    if (!track.title) throw new Error(`${path}.title is required`)
    if (row.videoUrl !== undefined) track.videoUrl = mediaUrl(row.videoUrl, baseUrl, `${path}.videoUrl`)
    if (row.youtubeId !== undefined) {
      if (typeof row.youtubeId !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(row.youtubeId)) {
        throw new Error(`${path}.youtubeId must be an 11-character video ID`)
      }
      track.youtubeId = row.youtubeId
    }
    if (!track.videoUrl && !track.youtubeId) throw new Error(`${path} needs videoUrl or youtubeId`)
    if (row.crop !== undefined) {
      if (!row.crop || typeof row.crop !== 'object') throw new Error(`${path}.crop must be an object`)
      track.crop = {}
      for (const field of ['top', 'left', 'width', 'height']) {
        const value = row.crop[field]
        if (!Number.isFinite(value) || Math.abs(value) > 1000) throw new Error(`${path}.crop.${field} must be a finite percentage`)
        track.crop[field] = value
      }
    }
    if (row.videoFit !== undefined) {
      if (!row.videoFit || typeof row.videoFit !== 'object') throw new Error(`${path}.videoFit must be an object`)
      track.videoFit = {}
      for (const field of ['width', 'height']) {
        const value = row.videoFit[field]
        if (value !== undefined) {
          if (typeof value !== 'string' || !/^\d+(?:\.\d+)?(?:%|px)$/.test(value)) throw new Error(`${path}.videoFit.${field} must be a percentage or pixel length`)
          track.videoFit[field] = value
        }
      }
      if (row.videoFit.objectFit !== undefined) {
        if (!['contain', 'cover', 'fill', 'none', 'scale-down'].includes(row.videoFit.objectFit)) throw new Error(`${path}.videoFit.objectFit is invalid`)
        track.videoFit.objectFit = row.videoFit.objectFit
      }
    }
    return track
  })
}

export async function loadPlaylist({
  url = import.meta.env?.VITE_PLAYLIST_URL || '/playlist.json',
  baseUrl = globalThis.location?.href || 'http://localhost/',
  fetch: fetchPlaylist = globalThis.fetch,
} = {}) {
  try {
    const source = mediaUrl(url, baseUrl, 'Playlist URL')
    const response = await fetchPlaylist(source, { signal: AbortSignal.timeout(10000), credentials: 'omit' })
    if (!response.ok) throw new Error('Playlist could not be loaded')
    return { tracks: parsePlaylist(await response.json(), response.url || source), error: null }
  } catch {
    // Avoid reflecting deployment URLs or server response details into the UI.
    return { tracks: [], error: 'The playlist could not be loaded.' }
  }
}
