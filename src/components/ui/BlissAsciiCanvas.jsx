import { useEffect, useRef } from 'react'

const ASCII_CHARS = ' .,:;-+*=%@#S'

function drawCloud(ctx, x, y, w, h, time) {
  ctx.save()
  ctx.globalAlpha = 0.92 + Math.sin(time * 0.3) * 0.04

  const cloudGrad = ctx.createRadialGradient(
    x + w / 2, y + h / 2, 0,
    x + w / 2, y + h / 2, w * 0.6
  )
  cloudGrad.addColorStop(0, '#FFFFFF')
  cloudGrad.addColorStop(0.7, '#E3F2FD')
  cloudGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = cloudGrad

  ctx.beginPath()
  ctx.ellipse(x + w * 0.5, y + h * 0.6, w * 0.5, h * 0.4, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(x + w * 0.25, y + h * 0.45, w * 0.25, h * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(x + w * 0.6, y + h * 0.35, w * 0.3, h * 0.4, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(x + w * 0.75, y + h * 0.5, w * 0.2, h * 0.3, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawBlissScene(offCtx, W, H, time) {
  const skyGrad = offCtx.createLinearGradient(0, 0, 0, H * 0.65)
  skyGrad.addColorStop(0, '#0D47A1')
  skyGrad.addColorStop(0.4, '#1565C0')
  skyGrad.addColorStop(1, '#1976D2')
  offCtx.fillStyle = skyGrad
  offCtx.fillRect(0, 0, W, H)

  drawCloud(offCtx, (W * 0.15 + time * 8) % (W * 1.3) - W * 0.15, H * 0.12, 80, 40, time)
  drawCloud(offCtx, (W * 0.45 + time * 5) % (W * 1.3) - W * 0.15, H * 0.08, 120, 60, time)
  drawCloud(offCtx, (W * 0.72 + time * 6) % (W * 1.3) - W * 0.15, H * 0.18, 90, 45, time)
  drawCloud(offCtx, (W * 0.90 + time * 4) % (W * 1.3) - W * 0.15, H * 0.28, 70, 35, time)

  const hillGrad = offCtx.createLinearGradient(0, H * 0.5, 0, H)
  hillGrad.addColorStop(0, '#9CCC65')
  hillGrad.addColorStop(0.3, '#4CAF50')
  hillGrad.addColorStop(1, '#1B5E20')
  offCtx.fillStyle = hillGrad
  offCtx.beginPath()
  offCtx.moveTo(0, H)
  offCtx.bezierCurveTo(W * 0.1, H * 0.38, W * 0.4, H * 0.30, W * 0.55, H * 0.38)
  offCtx.bezierCurveTo(W * 0.7, H * 0.46, W * 0.85, H * 0.52, W, H * 0.48)
  offCtx.lineTo(W, H)
  offCtx.closePath()
  offCtx.fill()
}

export default function BlissAsciiCanvas() {
  const canvasRef = useRef(null)
  const offCanvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const offCanvas = document.createElement('canvas')
    offCanvasRef.current = offCanvas
    const offCtx = offCanvas.getContext('2d')

    const cellW = 10
    const cellH = 18

    function resize() {
      const dpr = 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'

      const cols = Math.ceil(canvas.width / cellW)
      const rows = Math.ceil(canvas.height / cellH)
      offCanvas.width = cols
      offCanvas.height = rows
    }

    resize()
    window.addEventListener('resize', resize)

    let startTime = performance.now()

    function render() {
      const now = performance.now()
      const time = (now - startTime) / 1000

      const W = canvas.width
      const H = canvas.height
      const cols = Math.ceil(W / cellW)
      const rows = Math.ceil(H / cellH)

      offCanvas.width = cols
      offCanvas.height = rows
      drawBlissScene(offCtx, cols, rows, time)

      const imageData = offCtx.getImageData(0, 0, cols, rows)
      const pixels = imageData.data

      ctx.fillStyle = 'rgba(5,6,10,0.12)'
      ctx.fillRect(0, 0, W, H)
      ctx.font = `${cellH * 0.85}px "Courier New", monospace`
      ctx.textBaseline = 'top'

      const isGlitchFrame = Math.random() > 0.995

      for (let row = 0; row < rows; row++) {
        const scanlinePulse = Math.sin(row * 0.5 + time * 4) > 0.9 ? 0.22 : 0

        for (let col = 0; col < cols; col++) {
          const idx = (row * cols + col) * 4
          let r = pixels[idx]
          let g = pixels[idx + 1]
          let b = pixels[idx + 2]

          r = Math.min(255, Math.floor(r * 1.35))
          g = Math.min(255, Math.floor(g * 1.35))
          b = Math.min(255, Math.floor(b * 1.35))

          const gray = (r * 0.299 + g * 0.587 + b * 0.114)
          r = Math.round(r * 0.7 + gray * 0.3)
          g = Math.round(g * 0.7 + gray * 0.3)
          b = Math.round(b * 0.7 + gray * 0.3)

          const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255

          const wind = Math.sin(col * 0.4 + time * 1.2 + row * 0.15) * 0.13
          const glitch = Math.random() > 0.998 ? (Math.random() - 0.5) * 0.3 : 0

          const finalBrightness = Math.max(0, Math.min(1, brightness + wind + glitch + scanlinePulse))
          const charIdx = Math.floor(finalBrightness * (ASCII_CHARS.length - 1))
          const char = ASCII_CHARS[charIdx]

          if (isGlitchFrame && Math.random() > 0.97) {
            r = Math.min(255, r + 30)
            b = Math.max(0, b - 20)
          }

          ctx.fillStyle = `rgb(${r},${g},${b})`
          ctx.fillText(char, col * cellW, row * cellH)
        }
      }

      animRef.current = requestAnimationFrame(render)
    }

    animRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      if (animRef.current) cancelAnimationFrame(animRef.current)
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
        zIndex: 1,
        opacity: 0.65,
      }}
    />
  )
}
