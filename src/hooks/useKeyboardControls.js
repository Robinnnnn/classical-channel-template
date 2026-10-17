import { useEffect } from 'react'

export function useKeyboardControls({
  onTogglePlay,
  onPrev,
  onNext,
  onToggleShuffle,
  onToggleDebug,
  onToggleZoom,
  onChannelChange,
}) {
  useEffect(() => {
    const isSpace = (e) => e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar'

    const blockSpaceDefault = (e) => {
      if (isSpace(e)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const handleKey = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        onToggleZoom()
      }
      if (isSpace(e)) {
        blockSpaceDefault(e)
        onTogglePlay()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowLeft') {
        e.preventDefault()
        onPrev()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
        e.preventDefault()
        onNext()
      }
      if (e.key === 's' || e.key === 'S') onToggleShuffle()
      if (e.key === 'd' || e.key === 'D') onToggleDebug()
      if (e.key === '1') onChannelChange('text')
      if (e.key === '2') onChannelChange('video')
      if (e.key === '3') onChannelChange('playlist')
    }

    window.addEventListener('keydown', handleKey, true)
    window.addEventListener('keypress', blockSpaceDefault, true)
    window.addEventListener('keyup', blockSpaceDefault, true)
    document.addEventListener('keydown', blockSpaceDefault, true)
    document.addEventListener('keypress', blockSpaceDefault, true)
    document.addEventListener('keyup', blockSpaceDefault, true)
    return () => {
      window.removeEventListener('keydown', handleKey, true)
      window.removeEventListener('keypress', blockSpaceDefault, true)
      window.removeEventListener('keyup', blockSpaceDefault, true)
      document.removeEventListener('keydown', blockSpaceDefault, true)
      document.removeEventListener('keypress', blockSpaceDefault, true)
      document.removeEventListener('keyup', blockSpaceDefault, true)
    }
  }, [onTogglePlay, onPrev, onNext, onToggleShuffle, onToggleDebug, onToggleZoom, onChannelChange])
}
