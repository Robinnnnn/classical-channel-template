import { useSearchParams } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import TV from './components/TV'
import BarrelDistortion from './components/BarrelDistortion'
import BackdropPicker from './components/BackdropPicker'
import ToggleButtons from './components/ToggleButtons'

// Preload all button pressed-state images
const PRELOAD_IMAGES = [
  '/images/button-1.webp',
  '/images/button-2.webp',
  '/images/button-3.webp',
  '/images/circle-1.webp',
  '/images/circle-2.webp',
  '/images/circle-3.webp',
]

PRELOAD_IMAGES.forEach((src) => {
  const img = new Image()
  img.src = src
})

const BACKDROP_PRESETS = ['velvet', 'halo', 'walnut', 'jazz', 'stage']

export default function App({ tracks, playlistError }) {
  const [searchParams, setSearchParams] = useSearchParams()

  // State from URL params
  const hasTrackParam = searchParams.get('track') !== null
  const hasChannelParam = searchParams.get('channel') !== null

  const initialChannel = hasChannelParam
    ? (searchParams.get('channel') || 'text')
    : 'text'

  const [currentTrack, setCurrentTrack] = useState(() => {
    const parsedTrack = parseInt(searchParams.get('track') || '0', 10)
    return hasTrackParam && Number.isFinite(parsedTrack)
      ? Math.max(0, Math.min(parsedTrack, Math.max(0, tracks.length - 1)))
      : Math.floor(Math.random() * tracks.length)
  })
  const [channel, setChannel] = useState(initialChannel)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(100)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [debugOpen, setDebugOpen] = useState(searchParams.get('debug') === '1')
  const [shuffle, setShuffle] = useState(() => localStorage.getItem('shuffle') === '1')
  const [isZoomed, setIsZoomed] = useState(false)
  const [backdrop, setBackdrop] = useState(() => {
    const saved = localStorage.getItem('backdrop')
    if (saved === 'walnut-soft' || saved === 'walnut-fine') return 'walnut'
    return BACKDROP_PRESETS.includes(saved) ? saved : 'velvet'
  })

  // Sync state to URL params
  useEffect(() => {
    const params = {}
    if (currentTrack !== 0) params.track = currentTrack.toString()
    if (channel !== 'text') params.channel = channel
    if (debugOpen) params.debug = '1'
    setSearchParams(params, { replace: true })
  }, [currentTrack, channel, debugOpen, setSearchParams])

  useEffect(() => {
    document.body.classList.toggle('debug-open-mode', debugOpen)
    return () => document.body.classList.remove('debug-open-mode')
  }, [debugOpen])

  useEffect(() => {
    localStorage.setItem('shuffle', shuffle ? '1' : '0')
  }, [shuffle])

  useEffect(() => {
    localStorage.setItem('backdrop', backdrop)
    document.body.setAttribute('data-backdrop', backdrop)
    return () => document.body.removeAttribute('data-backdrop')
  }, [backdrop])

  const playTrack = useCallback((index) => {
    if (!tracks[index]) return
    setHasInteracted(true)
    setCurrentTrack(index)
    setIsPlaying(true)
    setChannel('video')
  }, [tracks])

  const handleChannelChange = useCallback((ch) => {
    setChannel(ch)
    // Autoplay when switching to video channel if user hasn't played/paused yet
    if (ch === 'video' && tracks.length && !hasInteracted && !isPlaying) {
      setIsPlaying(true)
    }
  }, [hasInteracted, isPlaying, tracks.length])

  const togglePlay = useCallback(() => {
    if (!tracks.length) return
    setHasInteracted(true)
    setIsPlaying(prev => !prev)
  }, [tracks.length])

  const nextTrack = useCallback(() => {
    if (!tracks.length) return
    setHasInteracted(true)
    setCurrentTrack(prev => {
      let next
      if (shuffle && tracks.length > 1) {
        next = Math.floor(Math.random() * (tracks.length - 1))
        if (next >= prev) next += 1
      } else {
        next = (prev + 1) % tracks.length
      }
      if (next !== prev) {
        setIsPlaying(true)
        setChannel('video')
      }
      return next
    })
  }, [shuffle, tracks.length])

  const goToPrevTrack = useCallback(() => {
    if (!tracks.length) return
    setCurrentTrack(prev => {
      const next = Math.max(prev - 1, 0)
      if (next !== prev) {
        setIsPlaying(true)
        setChannel('video')
      }
      return next
    })
  }, [tracks.length])

  const prevTrack = useCallback(() => {
    setHasInteracted(true)
    // If more than 3 seconds into the song, restart it. Otherwise go to previous track.
    window.dispatchEvent(new CustomEvent('prev-track'))
  }, [])

  return (
    <div className={`app${debugOpen ? ' debug-open' : ''}`}>
      <div className="app-tv-wrap">
        {!tracks.length && <p role="status">{playlistError || 'No recordings have been configured.'}</p>}
        <p className="mobile-note">for ideal viewing, use a desktop browser</p>
        <TV
          tracks={tracks}
          currentTrack={currentTrack}
          channel={channel}
          isPlaying={isPlaying}
          volume={volume}
          onChannelChange={handleChannelChange}
          onPlay={playTrack}
          onTogglePlay={togglePlay}
          onNext={nextTrack}
          onPrev={prevTrack}
          onGoToPrev={goToPrevTrack}
          onVolumeChange={setVolume}
          hasInteracted={hasInteracted}
          debugOverlay={debugOpen}
          onToggleShuffle={() => setShuffle(prev => !prev)}
          onToggleDebug={() => setDebugOpen(prev => !prev)}
          isZoomed={isZoomed}
          onToggleZoom={() => setIsZoomed(prev => !prev)}
        />
        <BackdropPicker value={backdrop} onChange={setBackdrop} />
        <ToggleButtons
          shuffle={shuffle}
          isZoomed={isZoomed}
          debugOpen={debugOpen}
          onToggleShuffle={() => setShuffle(prev => !prev)}
          onToggleZoom={() => setIsZoomed(prev => !prev)}
          onToggleDebug={() => setDebugOpen(prev => !prev)}
        />
      </div>

      {debugOpen && <BarrelDistortion embedded />}
    </div>
  )
}
