import { useRef, useEffect, useState, useCallback } from 'react'
import { CRT_CLIP_PATH } from '../constants/layout'
import './BarrelDistortion.css'

const IMAGE_URL = '/barrel-source.png'

const SCREEN_W = 640
const SCREEN_H = 400

function applyBarrelDistortion(sourceImg, dstCanvas, k1, k2 = 0) {
  const dw = SCREEN_W
  const dh = SCREEN_H
  dstCanvas.width = dw
  dstCanvas.height = dh
  const dstCtx = dstCanvas.getContext('2d')

  // Render source at output size
  const srcCanvas = document.createElement('canvas')
  srcCanvas.width = dw
  srcCanvas.height = dh
  srcCanvas.getContext('2d').drawImage(sourceImg, 0, 0, sourceImg.width, sourceImg.height,
    0, 0, dw, dh)

  const srcData = srcCanvas.getContext('2d').getImageData(0, 0, dw, dh)
  const dstData = dstCtx.createImageData(dw, dh)
  const src = srcData.data
  const dst = dstData.data

  const cx = dw / 2
  const cy = dh / 2

  // For barrel distortion (positive k), corners map outside the source.
  // Normalize by the corner distortion factor to zoom in and fill edges.
  // For pincushion (negative k), corners map inward — no normalization needed.
  const cornerR2 = 2
  const cornerDist = 1 + k1 * cornerR2 + k2 * cornerR2 * cornerR2
  const norm = cornerDist > 1 ? cornerDist : 1

  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const nx = (x - cx) / cx
      const ny = (y - cy) / cy
      const r2 = nx * nx + ny * ny
      const r4 = r2 * r2
      const distortion = (1 + k1 * r2 + k2 * r4) / norm

      // Map to source coordinates
      const srcX = cx + nx * distortion * cx
      const srcY = cy + ny * distortion * cy

      const sx0 = Math.floor(srcX)
      const sy0 = Math.floor(srcY)
      const sx1 = Math.min(sx0 + 1, dw - 1)
      const sy1 = Math.min(sy0 + 1, dh - 1)
      const fx = srcX - sx0
      const fy = srcY - sy0

      if (sx0 >= 0 && sx0 < dw && sy0 >= 0 && sy0 < dh) {
        const i00 = (sy0 * dw + sx0) * 4
        const i10 = (sy0 * dw + sx1) * 4
        const i01 = (sy1 * dw + sx0) * 4
        const i11 = (sy1 * dw + sx1) * 4
        const di = (y * dw + x) * 4

        for (let c = 0; c < 4; c++) {
          dst[di + c] =
            src[i00 + c] * (1 - fx) * (1 - fy) +
            src[i10 + c] * fx * (1 - fy) +
            src[i01 + c] * (1 - fx) * fy +
            src[i11 + c] * fx * fy
        }
      }
    }
  }

  dstCtx.putImageData(dstData, 0, 0)
}

const VARIANTS = [
  { label: 'No Distortion', k1: 0, k2: 0 },
  { label: 'Hint', k1: 0.04, k2: 0.01 },
  { label: 'Subtle Barrel', k1: 0.08, k2: 0.02 },
  { label: 'Medium Barrel', k1: 0.18, k2: 0.04 },
  { label: 'CRT Bulge', k1: 0.25, k2: 0.15 },
  { label: 'Pincushion', k1: -0.2, k2: -0.05 },
]

export default function BarrelDistortion({ embedded = false }) {
  const [sourceImg, setSourceImg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fx, setFx] = useState({
    scanlineOpacity: 0.04,
    scanlineWidth: 2,
    grainOpacity: 0.08,
    grainSpeed: 0.4,
    glassOpacity: 0.09,
    glassSize: 50,
    aberrationStrength: 0.22,
    aberrationSpread: 18,
  })
  const canvasRefs = useRef([])

  const setParam = (key, value) => {
    setFx(prev => ({ ...prev, [key]: value }))
  }

  const setCanvasRef = useCallback((el, i) => {
    canvasRefs.current[i] = el
  }, [])

  // Load image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Store as a cover-fitted canvas at a large size so overscan can draw from it
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext('2d').drawImage(img, 0, 0)
      setSourceImg(canvas)
      setLoading(false)
    }
    img.onerror = () => {
      // Fallback: grid pattern
      const canvas = document.createElement('canvas')
      canvas.width = SCREEN_W * 2
      canvas.height = SCREEN_H * 2
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#e94560'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }
      setSourceImg(canvas)
      setLoading(false)
    }
    img.src = IMAGE_URL
  }, [])

  // Apply distortion when source is ready
  useEffect(() => {
    if (!sourceImg) return
    VARIANTS.forEach((v, i) => {
      const dst = canvasRefs.current[i]
      if (!dst) return
      if (v.k1 === 0 && v.k2 === 0) {
        dst.width = SCREEN_W
        dst.height = SCREEN_H
        dst.getContext('2d').drawImage(sourceImg, 0, 0, sourceImg.width, sourceImg.height,
          0, 0, SCREEN_W, SCREEN_H)
      } else {
        applyBarrelDistortion(sourceImg, dst, v.k1, v.k2)
      }
    })
  }, [sourceImg])

  const renderFxLayers = (fx) => (
    <>
      {fx.scanlineOpacity > 0 && <div className="barrel-scanlines" style={{
        background: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${fx.scanlineWidth}px, rgba(0,0,0,${fx.scanlineOpacity}) ${fx.scanlineWidth}px, rgba(0,0,0,${fx.scanlineOpacity}) ${fx.scanlineWidth * 2}px)`
      }} />}
      {fx.grainOpacity > 0 && <div className="barrel-grain" style={{
        opacity: fx.grainOpacity,
        animationDuration: `${fx.grainSpeed}s`,
      }} />}
      {fx.glassOpacity > 0 && <div className="barrel-glass" style={{
        background: `radial-gradient(ellipse ${fx.glassSize}% ${fx.glassSize * 0.67}% at 30% 25%, rgba(255,255,255,${fx.glassOpacity}) 0%, transparent 100%), radial-gradient(ellipse ${fx.glassSize * 0.5}% ${fx.glassSize * 0.33}% at 70% 75%, rgba(255,255,255,${fx.glassOpacity * 0.3}) 0%, transparent 100%)`
      }} />}
      {fx.aberrationStrength > 0 && <div className="barrel-aberration" style={{
        boxShadow: `inset -${fx.aberrationSpread * 0.25}px 0 ${fx.aberrationSpread}px -2px rgba(255,0,0,${fx.aberrationStrength}), inset ${fx.aberrationSpread * 0.25}px 0 ${fx.aberrationSpread}px -2px rgba(0,255,255,${fx.aberrationStrength})`
      }} />}
    </>
  )

  return (
    <div className={embedded ? 'barrel-page barrel-page--embedded' : 'barrel-page'}>
      {/* Shared SVG clip-path definition */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="barrel-crt-clip" clipPathUnits="objectBoundingBox">
            <path d={CRT_CLIP_PATH} />
          </clipPath>
          <clipPath id="barrel-tv-crt-clip" clipPathUnits="objectBoundingBox">
            <path d={CRT_CLIP_PATH} />
          </clipPath>
        </defs>
      </svg>

      {!embedded && <h1 className="barrel-title">Barrel Distortion Variants</h1>}
      <p className="barrel-subtitle">Same CRT mask from the main screen applied to each</p>

      <div className="barrel-controls">
        <div className="barrel-control-group">
          <h3>Scanlines</h3>
          <label>Opacity <span>{fx.scanlineOpacity.toFixed(2)}</span></label>
          <input type="range" min="0" max="0.5" step="0.01"
            value={fx.scanlineOpacity} onChange={e => setParam('scanlineOpacity', +e.target.value)} />
          <label>Width <span>{fx.scanlineWidth}px</span></label>
          <input type="range" min="1" max="6" step="1"
            value={fx.scanlineWidth} onChange={e => setParam('scanlineWidth', +e.target.value)} />
        </div>
        <div className="barrel-control-group">
          <h3>Film Grain</h3>
          <label>Opacity <span>{fx.grainOpacity.toFixed(2)}</span></label>
          <input type="range" min="0" max="0.2" step="0.005"
            value={fx.grainOpacity} onChange={e => setParam('grainOpacity', +e.target.value)} />
          <label>Speed <span>{fx.grainSpeed.toFixed(1)}s</span></label>
          <input type="range" min="0.1" max="1" step="0.1"
            value={fx.grainSpeed} onChange={e => setParam('grainSpeed', +e.target.value)} />
        </div>
        <div className="barrel-control-group">
          <h3>Glass Reflection</h3>
          <label>Opacity <span>{fx.glassOpacity.toFixed(2)}</span></label>
          <input type="range" min="0" max="0.2" step="0.005"
            value={fx.glassOpacity} onChange={e => setParam('glassOpacity', +e.target.value)} />
          <label>Size <span>{fx.glassSize}%</span></label>
          <input type="range" min="20" max="100" step="5"
            value={fx.glassSize} onChange={e => setParam('glassSize', +e.target.value)} />
        </div>
        <div className="barrel-control-group">
          <h3>Chromatic Aberration</h3>
          <label>Strength <span>{fx.aberrationStrength.toFixed(2)}</span></label>
          <input type="range" min="0" max="0.4" step="0.01"
            value={fx.aberrationStrength} onChange={e => setParam('aberrationStrength', +e.target.value)} />
          <label>Spread <span>{fx.aberrationSpread}px</span></label>
          <input type="range" min="2" max="20" step="1"
            value={fx.aberrationSpread} onChange={e => setParam('aberrationSpread', +e.target.value)} />
        </div>
      </div>

      {loading && <p className="barrel-loading">Loading image...</p>}

      <div className="barrel-grid">
        {VARIANTS.map((v, i) => (
          <div className="barrel-card" key={v.label}>
            <div className="barrel-screen">
              <canvas
                ref={el => setCanvasRef(el, i)}
                width={SCREEN_W}
                height={SCREEN_H}
              />
              <div className="barrel-vignette" />
              {renderFxLayers(fx)}
            </div>
            <div className="barrel-label">
              <span className="barrel-name">{v.label}</span>
              <span className="barrel-params">
                k1={v.k1} k2={v.k2}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!embedded && (
        <>
          <h2 className="barrel-title" style={{ marginTop: '2em' }}>Live TV Preview</h2>
          <p className="barrel-subtitle">FX overlays applied to live screen</p>
        </>
      )}
    </div>
  )
}
