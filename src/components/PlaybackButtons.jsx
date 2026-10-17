import { useState, useCallback } from 'react'
import { useClickSound } from '../hooks/useClickSound'
import Tooltip from './Tooltip'
import './PlaybackButtons.css'

const alignBottom = (rect) => {
  const siblings = document.querySelectorAll('.pb-btn')
  const maxBottom = Math.max(...Array.from(siblings).map(el => el.getBoundingClientRect().bottom))
  return {
    x: rect.left + rect.width / 2,
    y: maxBottom + 8,
    transform: 'translateX(-50%)',
  }
}

export default function PlaybackButtons({ isPlaying, onTogglePlay, onNext, onPrev }) {
  const playClick = useClickSound()
  const [prevPressed, setPrevPressed] = useState(false)
  const [nextPressed, setNextPressed] = useState(false)

  const handlePrev = useCallback(() => {
    playClick()
    onPrev()
  }, [onPrev, playClick])

  const handleNext = useCallback(() => {
    playClick()
    onNext()
  }, [onNext, playClick])

  const handleTogglePlay = useCallback(() => {
    playClick()
    onTogglePlay()
  }, [onTogglePlay, playClick])

  return (
    <>
      {/* Prev — momentary press */}
      <Tooltip text="Previous track [⌘←]" positionFn={alignBottom}>
        <button
          className="pb-btn pb-btn--prev"
          onMouseDown={() => setPrevPressed(true)}
          onMouseUp={() => { setPrevPressed(false); handlePrev() }}
          onMouseLeave={() => setPrevPressed(false)}
          onTouchStart={() => setPrevPressed(true)}
          onTouchEnd={(e) => { setPrevPressed(false); handlePrev(); e.preventDefault() }}
          aria-label="Previous track"
        >
          {prevPressed && (
            <img src="/images/circle-1.webp" alt="" draggable={false} />
          )}
        </button>
      </Tooltip>

      {/* Play/Pause — toggle */}
      <Tooltip text={`${isPlaying ? 'Pause' : 'Play'} [Space]`} positionFn={alignBottom}>
        <button
          className="pb-btn pb-btn--play"
          onClick={handleTogglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying && (
            <img src="/images/circle-2.webp" alt="" draggable={false} />
          )}
        </button>
      </Tooltip>

      {/* Next — momentary press */}
      <Tooltip text="Next track [⌘→]" positionFn={alignBottom}>
        <button
          className="pb-btn pb-btn--next"
          onMouseDown={() => setNextPressed(true)}
          onMouseUp={() => { setNextPressed(false); handleNext() }}
          onMouseLeave={() => setNextPressed(false)}
          onTouchStart={() => setNextPressed(true)}
          onTouchEnd={(e) => { setNextPressed(false); handleNext(); e.preventDefault() }}
          aria-label="Next track"
        >
          {nextPressed && (
            <img src="/images/circle-3.webp" alt="" draggable={false} />
          )}
        </button>
      </Tooltip>
    </>
  )
}
