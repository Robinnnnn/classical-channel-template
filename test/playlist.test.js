import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadPlaylist, parsePlaylist } from '../src/data/tracks.js'

const entry = () => ({ title: 'Example recording', performer: 'Example performer', videoUrl: './media/example.mp4' })

test('loads a supplied playlist, resolves media relative to its JSON, and omits request cookies', async () => {
  let requested
  const result = await loadPlaylist({
    url: '/catalog/playlist.json',
    baseUrl: 'https://app.example.com/',
    fetch: async (url, init) => {
      requested = { url, init }
      return Response.json({ tracks: [entry()] })
    },
  })
  assert.equal(result.error, null)
  assert.equal(result.tracks[0].videoUrl, 'https://app.example.com/catalog/media/example.mp4')
  assert.equal(requested.url, 'https://app.example.com/catalog/playlist.json')
  assert.equal(requested.init.credentials, 'omit')
  assert.ok(requested.init.signal instanceof AbortSignal)
})

test('supports empty playlists, bare arrays, video embeds, and existing crop/fit controls', () => {
  assert.deepEqual(parsePlaylist({ tracks: [] }), [])
  const tracks = parsePlaylist([{ title: 'Example video', youtubeId: 'abcdefghijk', crop: { top: -10, left: 0, width: 100, height: 120 } }])
  assert.equal(tracks[0].youtubeId, 'abcdefghijk')
  assert.equal(tracks[0].crop.top, -10)
  const [video] = parsePlaylist([{ ...entry(), videoFit: { width: '100%', height: '720px', objectFit: 'contain' } }], 'https://media.example.com/')
  assert.equal(video.videoFit.objectFit, 'contain')
})

test('rejects malformed or unsafe sources instead of rendering arbitrary embed/style input', () => {
  for (const value of [null, {}, { tracks: {} }]) assert.throws(() => parsePlaylist(value))
  for (const row of [
    { title: '', videoUrl: 'https://media.example.com/a.mp4' },
    { title: 'Missing source' },
    { ...entry(), videoUrl: 'javascript:alert(1)' },
    { ...entry(), videoUrl: 'https://user:password@media.example.com/a.mp4' },
    { title: 'Invalid embed', youtubeId: 'abc?autoplay=1' },
    { ...entry(), videoFit: { width: 'url(https://example.com)' } },
    { ...entry(), crop: { top: 0, left: 0, width: Infinity, height: 100 } },
  ]) assert.throws(() => parsePlaylist([row], 'https://app.example.com/'))
})

test('unavailable or malformed playlists produce a safe empty result', async () => {
  const expected = { tracks: [], error: 'The playlist could not be loaded.' }
  for (const fetch of [
    async () => new Response('not found', { status: 404 }),
    async () => new Response('invalid json'),
    async () => Response.json({ tracks: [{ title: 'Missing media' }] }),
    async () => { throw new Error('private upstream failure details') },
  ]) assert.deepEqual(await loadPlaylist({ url: 'https://media.example.com/playlist.json', fetch }), expected)
  let called = false
  assert.deepEqual(await loadPlaylist({ url: 'data:application/json,[]', fetch: async () => { called = true } }), expected)
  assert.equal(called, false)
})
