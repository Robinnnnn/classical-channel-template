import { useCallback } from 'react'
import { useClickSound } from '../hooks/useClickSound'
import Tooltip from './Tooltip'
import './ChannelButtons.css'

const CHANNELS = [
  { id: 'text', pressedImg: '/images/button-1.webp', tooltip: 'Info [1]' },
  { id: 'video', pressedImg: '/images/button-2.webp', tooltip: 'Footage [2]' },
  { id: 'playlist', pressedImg: '/images/button-3.webp', tooltip: 'Playlist [3]' },
]

const alignRight = (rect) => {
  const siblings = document.querySelectorAll('.channel-btn')
  const maxRight = Math.max(...Array.from(siblings).map(el => el.getBoundingClientRect().right))
  return {
    x: maxRight + 8,
    y: rect.top + rect.height / 2,
    transform: 'translateY(-50%)',
  }
}

export default function ChannelButtons({ activeChannel, onChange }) {
  const playClick = useClickSound()

  const handleClick = useCallback((channelId) => {
    playClick()
    onChange(channelId)
  }, [onChange, playClick])

  return (
    <>
      {CHANNELS.map((ch) => (
        <Tooltip key={ch.id} text={ch.tooltip} positionFn={alignRight}>
          <button
            className={`channel-btn channel-btn--${ch.id}`}
            onClick={() => handleClick(ch.id)}
            aria-label={`${ch.id} channel`}
            aria-pressed={activeChannel === ch.id}
          >
            {activeChannel === ch.id && (
              <img src={ch.pressedImg} alt="" draggable={false} />
            )}
          </button>
        </Tooltip>
      ))}
    </>
  )
}
