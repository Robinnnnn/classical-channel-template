import { splitTitle, splitPerformer, formatCreditLine, formatArrangement } from '../utils/formatTrack'
import './NowPlayingCard.css'

export default function NowPlayingCard({ track, cycle }) {
  if (!track) return null

  const [title, subtitle] = splitTitle(track.title)
  const [performerMain, performerDetail] = splitPerformer(track.performer)
  const creditMain = formatCreditLine(track.composer, performerMain)
  const arrangement = formatArrangement(track.arrangement)

  return (
    <div key={cycle} className="now-playing-card" aria-live="polite">
      <div className="now-playing-bar">
        <div className="now-playing-text">
          <div className="now-playing-title">{title}</div>
          {subtitle && <div className="now-playing-subtitle">{subtitle}</div>}
          <div className="now-playing-composer">
            {creditMain}
            {performerDetail && <><br />{performerDetail}</>}
          </div>
          {arrangement && <div className="now-playing-arrangement">{arrangement}</div>}
        </div>
      </div>
    </div>
  )
}
