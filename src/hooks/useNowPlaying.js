import { useState, useRef, useCallback, useEffect } from 'react'

export function useNowPlaying({ tracks, currentTrack, isPlaying, channel }) {
  const hideTimeoutRef = useRef(null)
  const hasStartedRef = useRef(false)
  const lastTrackRef = useRef(currentTrack)
  const [visible, setVisible] = useState(false)
  const [cycle, setCycle] = useState(0)
  const [track, setTrack] = useState(null)

  const show = useCallback((trackData) => {
    setTrack(trackData)
    setCycle((prev) => prev + 1)
    setVisible(true)
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    hideTimeoutRef.current = setTimeout(() => setVisible(false), 7500)
  }, [])

  useEffect(() => {
    const trackChanged = currentTrack !== lastTrackRef.current

    if (trackChanged && isPlaying && channel === 'video') {
      show(tracks[currentTrack])
    }

    if (!hasStartedRef.current && isPlaying && channel === 'video') {
      hasStartedRef.current = true
      show(tracks[currentTrack])
    }

    lastTrackRef.current = currentTrack
  }, [currentTrack, isPlaying, channel, show, tracks])

  useEffect(() => () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
  }, [])

  return { visible, cycle, track }
}
