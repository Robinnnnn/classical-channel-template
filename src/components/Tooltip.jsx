import { useState, useCallback, useRef, cloneElement } from 'react'
import { createPortal } from 'react-dom'

const PLACEMENTS = {
  top: (rect) => ({
    x: rect.left + rect.width / 2,
    y: rect.top - 8,
    transform: 'translate(-50%, -100%)',
  }),
  bottom: (rect) => ({
    x: rect.left + rect.width / 2,
    y: rect.bottom + 8,
    transform: 'translateX(-50%)',
  }),
  right: (rect) => ({
    x: rect.right + 8,
    y: rect.top + rect.height / 2,
    transform: 'translateY(-50%)',
  }),
}

export default function Tooltip({ text, placement = 'top', positionFn, children }) {
  const [visible, setVisible] = useState(false)
  const [style, setStyle] = useState({})
  const ref = useRef(null)

  const show = useCallback(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const pos = positionFn ? positionFn(rect) : PLACEMENTS[placement](rect)
    setStyle({ left: pos.x, top: pos.y, transform: pos.transform })
    setVisible(true)
  }, [placement, positionFn])

  const hide = useCallback(() => setVisible(false), [])

  return (
    <>
      {cloneElement(children, {
        ref,
        onMouseEnter: (e) => { show(); children.props.onMouseEnter?.(e) },
        onMouseLeave: (e) => { hide(); children.props.onMouseLeave?.(e) },
      })}
      {createPortal(
        <div
          className={`tooltip-text${visible ? ' visible' : ''}`}
          style={style}
        >
          {text}
        </div>,
        document.body
      )}
    </>
  )
}
