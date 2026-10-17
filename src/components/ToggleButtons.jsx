import './ToggleButtons.css'

export default function ToggleButtons({ shuffle, isZoomed, debugOpen, onToggleShuffle, onToggleZoom, onToggleDebug }) {
  return (
    <div className="button-stack">
      <button
        type="button"
        className={`toggle-btn${shuffle ? ' active' : ''}`}
        onClick={onToggleShuffle}
      >
        {shuffle ? '\u2713 ' : ''}shuffle [S]
      </button>
      <button
        type="button"
        className={`toggle-btn fullscreen-btn${isZoomed ? ' active' : ''}`}
        onClick={onToggleZoom}
      >
        {isZoomed ? '\u2713 ' : ''}fullscreen [F]
      </button>
      <button
        type="button"
        className={`toggle-btn${debugOpen ? ' active' : ''}`}
        onClick={onToggleDebug}
      >
        {debugOpen ? '\u2713 ' : ''}debug [D]
      </button>
    </div>
  )
}
