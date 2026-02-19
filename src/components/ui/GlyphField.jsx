import { useEffect, useRef } from 'react'

const GLYPHS = '01░▒▓▄▀─│╬╫╪'

export default function GlyphField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const COLS = 20
    const ROWS = 20

    // Each cell: { char, depth, y, changeTimer, color }
    const cells = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const depth = Math.random() * 10
        cells.push({
          char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          depth,
          y: r,
          changeTimer: Math.random() * 120,
          color: depth < 5
            ? `rgba(30,136,229,${0.15 + (10-depth)*0.04})`
            : `rgba(76,175,80,${0.1 + (depth-5)*0.04})`,
        })
      }
    }

    let frame = 0
    let animId

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function render() {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cellW = canvas.width / COLS
      const cellH = canvas.height / ROWS

      cells.forEach((cell, idx) => {
        const col = idx % COLS
        const row = Math.floor(idx / COLS)

        // Drift downward slowly
        cell.y += 0.002 * (1 + cell.depth * 0.1)
        if (cell.y > ROWS + 1) cell.y = -1

        // Change character on timer
        cell.changeTimer--
        if (cell.changeTimer <= 0) {
          cell.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          cell.changeTimer = 80 + Math.random() * 160
        }

        const x = col * cellW + cellW / 2
        const y = (cell.y - row + row) * cellH + cellH / 2
        const realY = row * cellH + ((cell.y % 1) * cellH)

        // Depth-based size
        const fontSize = 10 + cell.depth * 0.8
        ctx.font = `${fontSize}px "Courier New", monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = cell.color
        ctx.fillText(cell.char, col * cellW + cellW / 2, realY)
      })

      animId = requestAnimationFrame(render)
    }

    render()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.6,
        pointerEvents: 'none',
      }}
    />
  )
}
