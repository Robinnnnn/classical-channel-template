import { useRef, useEffect } from 'react'
import './PlaylistChannel.css'

export default function PlaylistChannel({ tracks, currentTrack, active, onPlay }) {
  const activeTrackRef = useRef(null)

  useEffect(() => {
    if (active && activeTrackRef.current) {
      activeTrackRef.current.scrollIntoView({ block: 'center' })
    }
  }, [active, currentTrack])

  return (
    <div className={`screen-content${active ? ' active' : ''}`}>
      <ul className="playlist">
        {tracks.map((t, i) => (
          <li
            key={i}
            ref={i === currentTrack ? activeTrackRef : null}
            className={i === currentTrack ? 'active' : ''}
            onClick={() => onPlay(i)}
          >
            <span className="track-number">{String(i + 1).padStart(2, '0')}</span>
            <span className="track-info">
              <span className="track-title">{t.title}</span>
              <span className="track-composer">{t.composer}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
