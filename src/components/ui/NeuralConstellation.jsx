import { useEffect, useRef } from 'react'

const NODE_COLORS = ['#8b5cf6', '#1E88E5', '#00ffd5', '#a78bfa', '#42A5F5']

export default function NeuralConstellation({ opacity = 1 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let mouse = { x: -999, y: -999 }

    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const nodes = Array.from({ length: 60 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 2 + Math.random() * 2,
      color: NODE_COLORS[i % NODE_COLORS.length],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.04,
      firing: false,
      fireTimer: 0,
    }))

    const firingInterval = setInterval(() => {
      const node = nodes[Math.floor(Math.random() * nodes.length)]
      node.firing = true
      node.fireTimer = 30
    }, 800)

    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    window.addEventListener('mousemove', handleMouseMove)

    function render() {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      nodes.forEach(node => {
        node.x += node.vx
        node.y += node.vy
        node.pulse += node.pulseSpeed
        if (node.firing) node.fireTimer--
        if (node.fireTimer <= 0) node.firing = false

        if (node.x < 0 || node.x > W) node.vx *= -1
        if (node.y < 0 || node.y > H) node.vy *= -1

        const dx = node.x - mouse.x, dy = node.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          node.vx += (dx / dist) * 0.15
          node.vy += (dy / dist) * 0.15
        }

        node.vx *= 0.99
        node.vy *= 0.99
        const maxV = 0.8
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy)
        if (speed > maxV) { node.vx *= maxV / speed; node.vy *= maxV / speed }
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.3
            ctx.beginPath()
            ctx.strokeStyle = nodes[i].color
            ctx.globalAlpha = alpha
            ctx.lineWidth = 0.8
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }

        const dx = nodes[i].x - mouse.x, dy = nodes[i].y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          ctx.beginPath()
          ctx.strokeStyle = nodes[i].color
          ctx.globalAlpha = (1 - dist / 200) * 0.5
          ctx.lineWidth = 1
          ctx.moveTo(nodes[i].x, nodes[i].y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
      }

      nodes.forEach(node => {
        const glow = Math.sin(node.pulse) * 0.5 + 0.5
        const r = node.firing ? node.r * 2.5 : node.r * (1 + glow * 0.3)

        if (node.firing) {
          for (let ring = 1; ring <= 3; ring++) {
            const ringProgress = (30 - node.fireTimer) / 30
            ctx.beginPath()
            ctx.arc(node.x, node.y, r + ring * 8 * ringProgress, 0, Math.PI * 2)
            ctx.strokeStyle = node.color
            ctx.globalAlpha = (1 - ringProgress) * 0.4 / ring
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.globalAlpha = 0.7 + glow * 0.3
        ctx.shadowColor = node.color
        ctx.shadowBlur = node.firing ? 20 : 8
        ctx.fill()
        ctx.shadowBlur = 0
      })

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(render)
    }

    render()
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      ro.disconnect()
      cancelAnimationFrame(animId)
      clearInterval(firingInterval)
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
