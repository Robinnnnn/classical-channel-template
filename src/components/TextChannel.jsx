import { useRef, useEffect } from 'react'
import { formatCreditLine } from '../utils/formatTrack'
import './TextChannel.css'

export default function TextChannel({ track, active, hasInteracted, currentTrack }) {
  const linerNotesRef = useRef(null)

  useEffect(() => {
    if (active && hasInteracted && linerNotesRef.current) {
      linerNotesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [active, hasInteracted, currentTrack])

  const creditLine = formatCreditLine(track?.composer, track?.performer)

  return (
    <div className={`screen-content${active ? ' active' : ''}`}>
      <div className="preamble">
        <h2>The Classical Channel</h2>
        <p className="tagline">S-tier classical selections for repeat listening</p>
        {track && (
          <div className="liner-notes" ref={linerNotesRef}>
            <h3>{track.title}</h3>
            <p className="composer">{creditLine}
              {track.arrangement && <><br /><span className="arrangement">{track.arrangement}</span></>}
            </p>
            <p>{track.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
