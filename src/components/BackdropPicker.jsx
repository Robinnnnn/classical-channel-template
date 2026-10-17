import './BackdropPicker.css'

const PRESETS = ['velvet', 'halo', 'walnut', 'jazz', 'stage']

export default function BackdropPicker({ value, onChange }) {
  return (
    <div className="backdrop-toggle-group" aria-label="backdrop presets">
      {PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          className={`backdrop-toggle${value === preset ? ' active' : ''}`}
          onClick={() => onChange(preset)}
        >
          {preset}
        </button>
      ))}
    </div>
  )
}
