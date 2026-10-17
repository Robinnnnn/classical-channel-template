import { useState, useEffect, useRef } from 'react'
import { SCREEN_BOUNDS } from '../constants/layout'
import { useKeyboardControls } from '../hooks/useKeyboardControls'
import Screen from './Screen'
import ChannelButtons from './ChannelButtons'
import PlaybackButtons from './PlaybackButtons'
import VolumeKnob from './VolumeKnob'
import CRTGlass from './CRTGlass'
import './TV.css'

export default function TV({
  tracks,
  currentTrack,
  channel,
  isPlaying,
  volume,
  onChannelChange,
  onPlay,
  onTogglePlay,
  onNext,
  onPrev,
  onGoToPrev,
  onVolumeChange,
  hasInteracted,
  debugOverlay = false,
  onToggleShuffle,
  onToggleDebug,
  isZoomed,
  onToggleZoom,
}) {
  const [debug, setDebug] = useState(false)
  const containerRef = useRef(null)

  useKeyboardControls({
    onTogglePlay, onPrev, onNext, onToggleShuffle, onToggleDebug, onToggleZoom, onChannelChange,
  })

  useEffect(() => {
    document.body.classList.toggle('tv-zoomed-mode', isZoomed)
    return () => document.body.classList.remove('tv-zoomed-mode')
  }, [isZoomed])

  // Compute zoom transform dynamically so the screen is centered in any viewport
  useEffect(() => {
    if (!isZoomed || !containerRef.current) return

    const compute = () => {
      const rect = containerRef.current.getBoundingClientRect()
      const { left: sL, top: sT, width: sW, height: sH } = SCREEN_BOUNDS

      const screenW = sW * rect.width
      const screenH = sH * rect.height
      const scx = (sL + sW / 2) * rect.width
      const scy = (sT + sH / 2) * rect.height

      const vw = window.innerWidth
      const vh = window.innerHeight
      const scale = Math.min(vw / screenW, vh / screenH) * 0.85

      const tx = vw / 2 - (rect.left + scx)
      const ty = vh / 2 - (rect.top + scy)

      const el = containerRef.current
      el.style.setProperty('--zoom-scale', scale)
      el.style.setProperty('--zoom-tx', `${tx}px`)
      el.style.setProperty('--zoom-ty', `${ty}px`)
      el.style.setProperty('--zoom-ox', `${scx}px`)
      el.style.setProperty('--zoom-oy', `${scy}px`)
    }

    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [isZoomed])

  return (
    <div className={`tv-container${isZoomed ? ' tv-zoomed' : ''}`} ref={containerRef}>
      <div className="tv-inner">
      {/* Layer 1: Screen content */}
      <Screen
        tracks={tracks}
        currentTrack={currentTrack}
        channel={channel}
        isPlaying={isPlaying}
        volume={volume}
        onPlay={onPlay}
        hasInteracted={hasInteracted}
        onNext={onNext}
        onPrev={onGoToPrev}
      />

      {/* Layer 2: CRT glass overlay */}
      <CRTGlass />

      {/* Layer 3: TV cabinet image */}
      <img
        className="tv-frame"
        src="/images/tv-cabinet-removebg.webp"
        alt=""
        draggable={false}
      />

      {/* Layer 4: Interactive overlays */}
      <div className="controls-layer">
        {/* DEBUG: green rings for position verification (Ctrl+D) */}
        {(debug || debugOverlay) && (
          <>
            <div className="debug-ring debug-ch1" />
            <div className="debug-ring debug-ch2" />
            <div className="debug-ring debug-ch3" />
            <div className="debug-ring debug-pb1" />
            <div className="debug-ring debug-pb2" />
            <div className="debug-ring debug-pb3" />
            <div className="debug-ring debug-vol" />
          </>
        )}

        <ChannelButtons
          activeChannel={channel}
          onChange={onChannelChange}
        />
        <VolumeKnob
          volume={volume}
          onChange={onVolumeChange}
        />
        <PlaybackButtons
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onNext={onNext}
          onPrev={onPrev}
        />
      </div>
      </div>
    </div>
  )
}
