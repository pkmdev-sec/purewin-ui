import { useEffect, useRef } from 'react'

const WAVE_CONFIGS = [
  { freq: 0.3, amp: 35, speed: 0.5, color: '#4CAF50', opacity: 0.4 },
  { freq: 0.5, amp: 25, speed: 0.8, color: '#1E88E5', opacity: 0.35 },
  { freq: 0.7, amp: 20, speed: 1.1, color: '#00ffd5', opacity: 0.3 },
  { freq: 1.0, amp: 15, speed: 1.4, color: '#8BC34A', opacity: 0.25 },
  { freq: 0.4, amp: 40, speed: 0.6, color: '#42A5F5', opacity: 0.2 },
  { freq: 0.9, amp: 18, speed: 1.8, color: '#b18cff', opacity: 0.2 },
  { freq: 0.6, amp: 28, speed: 0.9, color: '#4CAF50', opacity: 0.15 },
  { freq: 1.2, amp: 12, speed: 2.0, color: '#1E88E5', opacity: 0.15 },
  { freq: 0.8, amp: 22, speed: 0.7, color: '#00ffd5', opacity: 0.12 },
  { freq: 0.45, amp: 32, speed: 1.3, color: '#8BC34A', opacity: 0.1 },
]

export default function SignalField({ opacity = 1 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let startTime = performance.now()

    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function render() {
      const t = (performance.now() - startTime) / 1000
      const W = canvas.width
      const H = canvas.height

      ctx.clearRect(0, 0, W, H)

      WAVE_CONFIGS.forEach(({ freq, amp, speed, color, opacity: waveOpacity }) => {
        const yBase = H / 2
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.globalAlpha = waveOpacity
        ctx.lineWidth = 1.5
        ctx.shadowColor = color
        ctx.shadowBlur = 8

        for (let x = 0; x <= W; x += 2) {
          const y = yBase + Math.sin(x * freq * 0.02 + t * speed) * amp
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      })

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      animId = requestAnimationFrame(render)
    }

    render()
    return () => {
      ro.disconnect()
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
        pointerEvents: 'none',
        opacity,
      }}
    />
  )
}
