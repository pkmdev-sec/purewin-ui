import { useEffect, useRef } from 'react'

// Isometric pixel-art cube renderer
// Grid of small isometric cubes that pulse and glow
// Inspired by SchematicConstellation but with 3D cubes instead of text nodes

function drawIsoCube(ctx, x, y, size, colorTop, colorLeft, colorRight, alpha) {
  // Top face (diamond shape)
  ctx.beginPath()
  ctx.moveTo(x, y - size * 0.5)              // top
  ctx.lineTo(x + size, y)                     // right
  ctx.lineTo(x, y + size * 0.5)              // bottom
  ctx.lineTo(x - size, y)                     // left
  ctx.closePath()
  ctx.fillStyle = colorTop.replace(')', `,${alpha})`)
  ctx.fill()

  // Left face
  ctx.beginPath()
  ctx.moveTo(x - size, y)
  ctx.lineTo(x, y + size * 0.5)
  ctx.lineTo(x, y + size * 1.0)
  ctx.lineTo(x - size, y + size * 0.5)
  ctx.closePath()
  ctx.fillStyle = colorLeft.replace(')', `,${alpha * 0.6})`)
  ctx.fill()

  // Right face
  ctx.beginPath()
  ctx.moveTo(x, y + size * 0.5)
  ctx.lineTo(x + size, y)
  ctx.lineTo(x + size, y + size * 0.5)
  ctx.lineTo(x, y + size * 1.0)
  ctx.closePath()
  ctx.fillStyle = colorRight.replace(')', `,${alpha * 0.4})`)
  ctx.fill()
}

const CUBE_COLORS = [
  { top: 'rgba(139,92,246', left: 'rgba(91,33,182', right: 'rgba(76,29,149' },   // violet
  { top: 'rgba(30,136,229', left: 'rgba(21,101,192', right: 'rgba(13,71,161' },  // blue
  { top: 'rgba(0,255,213', left: 'rgba(0,188,157', right: 'rgba(0,137,123' },    // cyan
  { top: 'rgba(76,175,80', left: 'rgba(46,125,50', right: 'rgba(27,94,32' },     // green
]

export default function CrystalLattice({ style = {} }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const COLS = 14
    const ROWS = 10
    const CUBE_SIZE = 28

    // Cell state: each has brightness, targetBrightness, colorIdx, activateTimer
    const cells = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        cells.push({
          row: r, col: c,
          brightness: 0.12 + Math.random() * 0.08,
          targetBrightness: 0.12,
          colorIdx: Math.floor(Math.random() * CUBE_COLORS.length),
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.02,
          activated: false,
          activateTimer: 0,
        })
      }
    }

    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let frame = 0

    // Periodic activation
    const activationInterval = setInterval(() => {
      const cell = cells[Math.floor(Math.random() * cells.length)]
      cell.activated = true
      cell.activateTimer = 60
      cell.targetBrightness = 0.85
      // Spread to neighbors
      cells.forEach(c => {
        if (Math.abs(c.row - cell.row) <= 1 && Math.abs(c.col - cell.col) <= 1 && c !== cell) {
          setTimeout(() => {
            c.targetBrightness = 0.45
            c.activateTimer = 40
            setTimeout(() => { c.targetBrightness = 0.12 }, 600)
          }, 150 + Math.random() * 200)
        }
      })
      setTimeout(() => { cell.targetBrightness = 0.12; cell.activated = false }, 800)
    }, 600)

    function render() {
      frame++
      const W = canvas.width, H = canvas.height

      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(0, 0, W, H)

      // Center the grid
      const gridW = COLS * CUBE_SIZE * 1.0
      const gridH = ROWS * CUBE_SIZE * 0.75
      const startX = W / 2
      const startY = (H - gridH) / 2 + gridH * 0.1

      // Draw cubes back-to-front for isometric depth
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cellIdx = r * COLS + c
          const cell = cells[cellIdx]

          // Update brightness
          cell.brightness += (cell.targetBrightness - cell.brightness) * 0.06
          cell.pulsePhase += cell.pulseSpeed

          if (cell.activateTimer > 0) cell.activateTimer--

          const pulseBrightness = cell.brightness + Math.sin(cell.pulsePhase) * 0.03

          // Isometric position
          const isoX = startX + (c - r) * CUBE_SIZE
          const isoY = startY + (c + r) * CUBE_SIZE * 0.5 - ROWS * CUBE_SIZE * 0.25

          const col = CUBE_COLORS[cell.colorIdx]
          drawIsoCube(ctx, isoX, isoY, CUBE_SIZE * 0.45, col.top, col.left, col.right, pulseBrightness)

          // Glow for activated cubes
          if (cell.activated || cell.brightness > 0.4) {
            const grad = ctx.createRadialGradient(isoX, isoY, 0, isoX, isoY, CUBE_SIZE)
            grad.addColorStop(0, col.top.replace(')', `,${cell.brightness * 0.3})`))
            grad.addColorStop(1, col.top.replace(')', ',0)'))
            ctx.fillStyle = grad
            ctx.fillRect(isoX - CUBE_SIZE, isoY - CUBE_SIZE, CUBE_SIZE * 2, CUBE_SIZE * 2)
          }

          // ASCII char above active cubes
          if (cell.brightness > 0.3) {
            ctx.font = '10px "Geist Pixel Circle", monospace'
            ctx.fillStyle = col.top.replace(')', `,${cell.brightness * 0.8})`)
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(Math.random() > 0.5 ? '1' : '0', isoX, isoY - CUBE_SIZE * 0.6)
          }
        }
      }

      animId = requestAnimationFrame(render)
    }
    render()
    return () => { ro.disconnect(); cancelAnimationFrame(animId); clearInterval(activationInterval) }
  }, [])

  return (
    <canvas ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }} />
  )
}
