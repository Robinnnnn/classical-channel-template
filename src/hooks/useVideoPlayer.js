import { useEffect, useRef } from 'react'

export function useVideoPlayer({ track, currentTrack, isPlaying, volume, onNext, onPrev }) {
  const videoRef = useRef(null)
  const iframeRef = useRef(null)
  const lastVolumeUpdate = useRef(0)

  // Auto-advance when track ends
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const handleEnded = () => onNext()
    video.addEventListener('ended', handleEnded)
    return () => video.removeEventListener('ended', handleEnded)
  }, [currentTrack, onNext])

  // Prev button: restart if >3s in, otherwise go to previous track
  useEffect(() => {
    const handlePrev = () => {
      const video = videoRef.current
      if (video && video.currentTime > 3) {
        video.currentTime = 0
        video.play().catch(() => {})
      } else {
        onPrev()
      }
    }
    window.addEventListener('prev-track', handlePrev)
    return () => window.removeEventListener('prev-track', handlePrev)
  }, [onPrev])

  // Sync play/pause to native <video>
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isPlaying) {
      const tryPlay = () => video.play().catch(() => {})
      if (video.readyState >= 2) {
        tryPlay()
      } else {
        video.addEventListener('loadeddata', tryPlay, { once: true })
        video.load()
      }
    } else {
      video.pause()
    }
  }, [isPlaying, currentTrack])

  // Sync volume to native <video>
  useEffect(() => {
    const video = videoRef.current
    if (video) video.volume = volume / 100
  }, [volume])

  // Sync volume to YouTube iframe
  useEffect(() => {
    if (track?.videoUrl) return
    const now = Date.now()
    if (now - lastVolumeUpdate.current < 50) return
    lastVolumeUpdate.current = now
    const iframe = iframeRef.current
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'setVolume',
        args: [volume]
      }), '*')
    }
  }, [volume, track])

  return { videoRef, iframeRef }
}
