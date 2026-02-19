import { useEffect, useRef, useCallback } from 'react'
import { useViewportVisibility } from '../../hooks/useViewportVisibility'

const PURPLE = { r: 139, g: 92, b: 246 }
const CYAN = { r: 0, g: 255, b: 213 }
const GRID_SPACING = 60
const GRID_ALPHA = 0.04
const PARTICLE_COUNT = 80
const ORB_COUNT = 4
const FPS_INTERVAL = 1000 / 30

function createParticles(w, h) {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.4 + 0.1,
    color: Math.random() > 0.3 ? PURPLE : CYAN,
  }))
}

function createOrbs(w, h) {
  return Array.from({ length: ORB_COUNT }, (_, i) => ({
    x: w * (0.2 + Math.random() * 0.6),
    y: h * (0.2 + Math.random() * 0.6),
    radius: 120 + Math.random() * 180,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    color: i % 2 === 0 ? PURPLE : CYAN,
    alpha: 0.04 + Math.random() * 0.03,
    phase: Math.random() * Math.PI * 2,
  }))
}

export default function HeroBackground() {
  const canvasRef = useRef(null)
  const { ref: wrapperRef, isVisibleRef } = useViewportVisibility({ rootMargin: '200px' })
  const stateRef = useRef(null)

  const initState = useCallback((w, h) => {
    stateRef.current = {
      particles: createParticles(w, h),
      orbs: createOrbs(w, h),
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let w = 0
    let h = 0
    let lastFrame = 0
    let raf = 0

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initState(w, h)
    }

    resize()
    window.addEventListener('resize', resize)

    function drawGrid() {
      ctx.strokeStyle = `rgba(${PURPLE.r}, ${PURPLE.g}, ${PURPLE.b}, ${GRID_ALPHA})`
      ctx.lineWidth = 0.5
      ctx.beginPath()
      for (let x = 0; x <= w; x += GRID_SPACING) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
      }
      for (let y = 0; y <= h; y += GRID_SPACING) {
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
      }
      ctx.stroke()
    }

    function drawOrbs(time) {
      const state = stateRef.current
      if (!state) return
      for (const orb of state.orbs) {
        orb.x += orb.vx
        orb.y += orb.vy

        if (orb.x < -orb.radius) orb.x = w + orb.radius
        if (orb.x > w + orb.radius) orb.x = -orb.radius
        if (orb.y < -orb.radius) orb.y = h + orb.radius
        if (orb.y > h + orb.radius) orb.y = -orb.radius

        const pulse = Math.sin(time * 0.0005 + orb.phase) * 0.3 + 0.7
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
        const { r, g, b } = orb.color
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${orb.alpha * pulse})`)
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${orb.alpha * pulse * 0.3})`)
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(orb.x - orb.radius, orb.y - orb.radius, orb.radius * 2, orb.radius * 2)
      }
    }

    function drawParticles() {
      const state = stateRef.current
      if (!state) return
      for (const p of state.particles) {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`
        ctx.fill()
      }
    }

    function drawConnections() {
      const state = stateRef.current
      if (!state) return
      const particles = state.particles
      const threshold = 120
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = dx * dx + dy * dy
          if (dist < threshold * threshold) {
            const alpha = (1 - Math.sqrt(dist) / threshold) * 0.08
            ctx.strokeStyle = `rgba(${PURPLE.r}, ${PURPLE.g}, ${PURPLE.b}, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    function render(time) {
      raf = requestAnimationFrame(render)

      if (!isVisibleRef.current) return

      const delta = time - lastFrame
      if (delta < FPS_INTERVAL) return
      lastFrame = time - (delta % FPS_INTERVAL)

      ctx.clearRect(0, 0, w, h)
      drawGrid()
      drawOrbs(time)
      drawParticles()
      drawConnections()
    }

    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [initState, isVisibleRef])

  return (
    <div ref={wrapperRef} style={{ position: 'absolute', inset: 0, contain: 'layout paint' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}
