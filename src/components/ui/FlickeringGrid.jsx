import { useEffect, useRef, useCallback } from 'react'
import { useViewportVisibility } from '../../hooks/useViewportVisibility'

/**
 * FlickeringGrid — React port of inspira-ui's FlickeringGrid.vue
 * Canvas-based grid of tiny squares that randomly flicker in opacity.
 */
export default function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = '#8b5cf6',
  maxOpacity = 0.25,
  style = {},
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const restartRef = useRef(null)

  const onBecomeVisible = useCallback(() => {
    if (restartRef.current) restartRef.current(performance.now())
  }, [])

  const isVisibleRef = useViewportVisibility(containerRef, { onBecomeVisible })

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId
    let squares, cols, rows, dpr
    let lastTime = 0

    // Parse color to rgba base
    let colorBase
    if (color.startsWith('#')) {
      const hex = color.replace(/^#/, '')
      const bigint = parseInt(hex, 16)
      const r = (bigint >> 16) & 255
      const g = (bigint >> 8) & 255
      const b = bigint & 255
      colorBase = `rgba(${r},${g},${b},`
    } else {
      colorBase = color.replace(/rgba?\(([^)]+)\).*/, 'rgba($1,').replace(/,\s*[\d.]+\)$/, ',')
      if (!colorBase.includes('rgba')) colorBase = `rgba(139,92,246,`
    }

    // Pre-compute palette of color strings to avoid template literals in draw loop
    const PALETTE_SIZE = 25
    const palette = new Array(PALETTE_SIZE)
    for (let i = 0; i < PALETTE_SIZE; i++) {
      const opacity = (i / (PALETTE_SIZE - 1)) * maxOpacity
      palette[i] = `${colorBase}${opacity})`
    }
    const paletteMax = PALETTE_SIZE - 1
    const paletteDivisor = maxOpacity > 0 ? maxOpacity : 1

    function setup() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = container.clientWidth
      const h = container.clientHeight
      if (!w || !h) return
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      cols = Math.floor(w / (squareSize + gridGap))
      rows = Math.floor(h / (squareSize + gridGap))
      squares = new Float32Array(cols * rows)
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity
      }
      fullRedrawCounter = 60
    }

    let fullRedrawCounter = 0

    function draw(time) {
      if (!isVisibleRef.current) return

      const delta = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time
      if (!squares || !cols || !rows) return

      fullRedrawCounter++
      const needsFullRedraw = fullRedrawCounter >= 60

      if (needsFullRedraw) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        fullRedrawCounter = 0
      }

      const totalCells = cols * rows
      // Calculate how many cells to update this frame
      const updateCount = Math.ceil(totalCells * flickerChance * delta)

      if (needsFullRedraw) {
        // Full redraw: draw all cells
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const idx = i * rows + j
            ctx.fillStyle = palette[Math.min(Math.round((squares[idx] / paletteDivisor) * paletteMax), paletteMax)]
            ctx.fillRect(
              i * (squareSize + gridGap) * dpr,
              j * (squareSize + gridGap) * dpr,
              squareSize * dpr,
              squareSize * dpr,
            )
          }
        }
      } else {
        // Partial update: only update random subset
        for (let k = 0; k < updateCount; k++) {
          const idx = Math.floor(Math.random() * totalCells)
          const i = Math.floor(idx / rows)
          const j = idx % rows
          squares[idx] = Math.random() * maxOpacity
          ctx.clearRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr,
          )
          ctx.fillStyle = palette[Math.min(Math.round((squares[idx] / paletteDivisor) * paletteMax), paletteMax)]
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr,
          )
        }
      }
      animId = requestAnimationFrame(draw)
    }

    restartRef.current = draw
    setup()
    animId = requestAnimationFrame(draw)

    const ro = new ResizeObserver(() => setup())
    ro.observe(container)

    return () => { cancelAnimationFrame(animId); ro.disconnect(); restartRef.current = null }
  }, [squareSize, gridGap, flickerChance, color, maxOpacity])

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', ...style }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', pointerEvents: 'none' }} />
    </div>
  )
}
