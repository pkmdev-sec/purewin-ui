import { useCallback, useEffect, useRef } from 'react'
import { useViewportVisibility } from '../../hooks/useViewportVisibility'

export default function HoloSun({ width = 600, height = 600, style = {} }) {
  const canvasRef = useRef(null)
  const wrapperRef = useRef(null)
  const restartRef = useRef(null)

  const onBecomeVisible = useCallback(() => {
    if (restartRef.current) restartRef.current(performance.now())
  }, [])

  const isVisibleRef = useViewportVisibility(wrapperRef, { onBecomeVisible })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    canvas.width = width
    canvas.height = height

    const PARTICLE_COUNT = 1200
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

    const projected = new Float32Array(PARTICLE_COUNT * 3)

    const BUCKET_COUNT = 16
    const buckets = Array.from({ length: BUCKET_COUNT }, () => [])
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
      if (!isVisibleRef.current) return
      if (timestamp - lastRenderTime < FRAME_INTERVAL) {
        animId = requestAnimationFrame(render)
        return
      }
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

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX)

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i]
        let x1 = p.ox * cosY - p.oz * sinY
        let z1 = p.ox * sinY + p.oz * cosY
        let y1 = p.oy
        let y2 = y1 * cosX - z1 * sinX
        let z2 = y1 * sinX + z1 * cosX
        const perspective = 350 / (350 + z2 * r)
        projected[i * 3] = cx + x1 * r * perspective
        projected[i * 3 + 1] = cy + y2 * r * perspective
        projected[i * 3 + 2] = (z2 + 1) / 2
      }

      for (let b = 0; b < BUCKET_COUNT; b++) buckets[b].length = 0

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const alpha = projected[i * 3 + 2]
        const bucketIdx = Math.max(0, Math.min(Math.floor(alpha * BUCKET_COUNT), BUCKET_COUNT - 1))
        buckets[bucketIdx].push(i)
      }

      for (let b = 0; b < BUCKET_COUNT; b++) {
        const bucket = buckets[b]
        if (bucket.length === 0) continue
        const alpha = (b + 0.5) / BUCKET_COUNT
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

        for (let j = 0; j < bucket.length; j++) {
          const i = bucket[j]
          const px = projected[i * 3]
          const py = projected[i * 3 + 1]
          const pAlpha = projected[i * 3 + 2]
          const size = 0.8 + pAlpha * 1.2
          ctx.fillRect(px - size * 0.5, py - size * 0.5, size, size)
        }
      }

      animId = requestAnimationFrame(render)
    }
    restartRef.current = render

    animId = requestAnimationFrame(render)
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animId)
      restartRef.current = null
    }
  }, [width, height])

  return (
    <div ref={wrapperRef} style={{ display: 'inline-block', ...style }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block' }}
      />
    </div>
  )
}
