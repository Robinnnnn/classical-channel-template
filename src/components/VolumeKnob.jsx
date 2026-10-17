import { useState, useRef, useCallback, useEffect } from 'react'
import Tooltip from './Tooltip'
import './VolumeKnob.css'

export default function VolumeKnob({ volume, onChange }) {
  // Map volume (0-100) to angle (-135 to 135 degrees)
  const volumeToAngle = (v) => (v / 100) * 270 - 135
  const angleToVolume = (a) => ((a + 135) / 270) * 100

  const [angle, setAngle] = useState(volumeToAngle(volume))
  const [isDragging, setIsDragging] = useState(false)
  const prevAngleRef = useRef(angle)
  const dragStartYRef = useRef(0)
  const dragStartAngleRef = useRef(angle)

  const updateAngle = useCallback((newAngle) => {
    const clamped = Math.max(-135, Math.min(135, newAngle))
    // Reject jumps larger than 90° in a single frame (dead zone crossing)
    if (Math.abs(clamped - prevAngleRef.current) > 90) return
    prevAngleRef.current = clamped
    setAngle(clamped)
    // Floor low volumes to true zero, ceil high volumes to true 100
    let vol = Math.round(angleToVolume(clamped))
    if (vol < 3) vol = 0
    if (vol > 97) vol = 100
    onChange(vol)
  }, [onChange])

  // Vertical drag (up/down) while holding the knob
  const handlePointerDown = useCallback((e) => {
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    dragStartYRef.current = clientY
    dragStartAngleRef.current = prevAngleRef.current
    setIsDragging(true)
    e.preventDefault()
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e) => {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      const deltaY = dragStartYRef.current - clientY
      const degreesPerPixel = 0.9
      const nextAngle = dragStartAngleRef.current + deltaY * degreesPerPixel
      updateAngle(nextAngle)
    }

    const handleUp = () => setIsDragging(false)

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('touchmove', handleMove)
    document.addEventListener('mouseup', handleUp)
    document.addEventListener('touchend', handleUp)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      document.removeEventListener('touchend', handleUp)
    }
  }, [isDragging, updateAngle])

  // Scroll wheel
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    updateAngle(angle - e.deltaY * 0.5)
  }, [angle, updateAngle])

  return (
    <Tooltip text="Volume — drag" placement="bottom">
      <div
        className="knob-outer"
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onWheel={handleWheel}
      >
        <div
          className="knob-inner"
          style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
        >
          <div className="knob-indicator" />
        </div>
      </div>
    </Tooltip>
  )
}
