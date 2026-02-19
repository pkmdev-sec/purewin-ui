import { useEffect, useRef } from 'react'
import { useViewportVisibility } from '../../hooks/useViewportVisibility'

export default function HoloSun({ width = 600, height = 600, style = {} }) {
  const canvasRef = useRef(null)
  const wrapperRef = useRef(null)
  const isVisibleRef = useViewportVisibility(wrapperRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    canvas.width = width
    canvas.height = height

    const PARTICLE_COUNT = 2200
    const cx = width / 2
    const cy = height / 2
    const sphereR = Math.min(width, height) * 0.38

    // Fibonacci sphere distribution
    const particles = []
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = goldenAngle * i
      const phi = Math.acos(1 - (2 * i / PARTICLE_COUNT))
      particles.push({
        ox: Math.sin(phi) * Math.cos(theta),
        oy: Math.sin(phi) * Math.sin(theta),
        oz: Math.cos(phi),
        x: 0, y: 0, z: 0,
      })
    }

    let rotX = 0
    let rotY = 0
    let mouseVX = 0
    let mouseVY = 0
    let frame = 0
    let animId

    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      const dx = (e.clientX - rect.left - cx) / cx
      const dy = (e.clientY - rect.top - cy) / cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      mouseVX = dy * Math.min(dist, 1) * 0.04
      mouseVY = dx * Math.min(dist, 1) * 0.04
    }
    canvas.addEventListener('mousemove', handleMouseMove)

    let lastRenderTime = 0
    const FRAME_INTERVAL = 1000 / 30

    function render(timestamp) {
      animId = requestAnimationFrame(render)
      if (!isVisibleRef.current) return
      if (timestamp - lastRenderTime < FRAME_INTERVAL) return
      lastRenderTime = timestamp

      frame++
      ctx.clearRect(0, 0, width, height)

      const corona = ctx.createRadialGradient(cx, cy, sphereR * 0.4, cx, cy, sphereR * 1.4)
      corona.addColorStop(0, 'rgba(76,175,80,0.08)')
      corona.addColorStop(0.5, 'rgba(30,136,229,0.04)')
      corona.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = corona
      ctx.fillRect(0, 0, width, height)

      const speed = 0.002 + Math.abs(mouseVX) * 0.5
      rotY += speed + mouseVY * 0.1
      rotX += 0.001 + mouseVX * 0.1
      mouseVX *= 0.95
      mouseVY *= 0.95

      const breath = 1 + Math.sin(frame * 0.02) * 0.015
      const r = sphereR * breath

      const projected = particles.map(p => {
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
        let x1 = p.ox * cosY - p.oz * sinY
        let z1 = p.ox * sinY + p.oz * cosY
        let y1 = p.oy
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX)
        let y2 = y1 * cosX - z1 * sinX
        let z2 = y1 * sinX + z1 * cosX
        const perspective = 350 / (350 + z2 * r)
        return {
          px: cx + x1 * r * perspective,
          py: cy + y2 * r * perspective,
          alpha: (z2 + 1) / 2,
        }
      })

      projected.forEach(({ px, py, alpha }) => {
        let rf, gf, bf
        if (alpha < 0.4) {
          rf = Math.floor(30 + alpha * 100)
          gf = Math.floor(136 + alpha * 200)
          bf = 229
        } else if (alpha < 0.75) {
          rf = Math.floor(76 * alpha)
          gf = Math.floor(175 * alpha)
          bf = Math.floor(80 + alpha * 60)
        } else {
          rf = Math.floor(100 + (alpha - 0.75) * 620)
          gf = Math.floor(220 + (alpha - 0.75) * 140)
          bf = Math.floor(80 + (alpha - 0.75) * 120)
        }
        const a = 0.2 + alpha * 0.8
        ctx.fillStyle = `rgba(${rf},${gf},${bf},${a})`
        const size = 0.8 + alpha * 1.2
        ctx.beginPath()
        ctx.arc(px, py, size, 0, Math.PI * 2)
        ctx.fill()
      })

    }

    animId = requestAnimationFrame(render)
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animId)
    }
  }, [width, height])

  return (
    <div ref={wrapperRef} style={{ display: 'inline-block', contain: 'layout paint', ...style }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block' }}
      />
    </div>
  )
}
