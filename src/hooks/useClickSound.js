import { useCallback, useRef } from 'react'

const CLICK_SOUND_PATH = '/audio/click.mp3'

export function useClickSound(volume = 0.3) {
  const audioRef = useRef(null)

  return useCallback(() => {
    try {
      // Reuse or create audio element
      if (!audioRef.current) {
        audioRef.current = new Audio(CLICK_SOUND_PATH)
        audioRef.current.volume = volume
      }
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    } catch {
      // Silently fail if audio isn't available
    }
  }, [volume])
}
