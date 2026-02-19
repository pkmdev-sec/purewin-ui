import { useEffect, useRef } from 'react'

const LAYER_CONFIGS = [
  { count: 12, z: 0.3, speed: 0.15, opacity: 0.15, color: '#1E88E5', size: 2 },
  { count: 18, z: 0.6, speed: 0.25, opacity: 0.25, color: '#8b5cf6', size: 3 },
  { count: 14, z: 1.0, speed: 0.35, opacity: 0.45, color: '#00ffd5', size: 4 },
]

function project(x, y, z, W, H) {
  const fov = 400
  const scale = fov / (fov + z * 200)
  return {
    x: W/2 + (x - W/2) * scale,
    y: H/2 + (y - H/2) * scale,
    scale,
  }
}

export default function NeuralDrift({ style = {} }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    let nodes = []
    let pulses = []

    function initNodes() {
      const W = canvas.width, H = canvas.height
      nodes = []
      LAYER_CONFIGS.forEach(layer => {
        for (let i = 0; i < layer.count; i++) {
          nodes.push({
            x: Math.random() * W,
            y: Math.random() * H,
            z: layer.z,
            vx: (Math.random() - 0.5) * layer.speed,
            vy: (Math.random() - 0.5) * layer.speed,
            color: layer.color,
            size: layer.size,
            opacity: layer.opacity,
            char: '01ABF'[Math.floor(Math.random() * 5)],
            charTimer: Math.floor(Math.random() * 60),
          })
        }
      })
    }

    function resize() {
      canvas.width = canvas.offsetWidth || 800
      canvas.height = canvas.offsetHeight || 600
      initNodes()
    }

    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Periodic pulse spawning
    const pulseInterval = setInterval(() => {
      if (nodes.length < 2) return
      const from = nodes[Math.floor(Math.random() * nodes.length)]
      // Find a nearby node on similar z layer
      const nearby = nodes.filter(n => n !== from && Math.abs(n.z - from.z) < 0.2 &&
        Math.sqrt((n.x-from.x)**2 + (n.y-from.y)**2) < 300)
      if (nearby.length > 0) {
        const to = nearby[Math.floor(Math.random() * nearby.length)]
        pulses.push({
          fromNode: from, toNode: to,
          progress: 0,
          speed: 0.008 + Math.random() * 0.006,
          char: '01ABCDEF'[Math.floor(Math.random() * 8)],
          color: from.color,
        })
      }
    }, 300)

    function render() {
      const W = canvas.width, H = canvas.height

      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.fillRect(0, 0, W, H)

      // Draw connections (bezier curves)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          if (Math.abs(a.z - b.z) > 0.35) continue
          const dx = a.x - b.x, dy = a.y - b.y
          const d = Math.sqrt(dx*dx + dy*dy)
          if (d > 200) continue

          const pa = project(a.x, a.y, a.z, W, H)
          const pb = project(b.x, b.y, b.z, W, H)

          const alpha = (1 - d/200) * a.opacity * 0.4
          const r = parseInt(a.color.slice(1,3),16)
          const g = parseInt(a.color.slice(3,5),16)
          const bv = parseInt(a.color.slice(5,7),16)

          // Bezier curve with slight curve
          const mx = (pa.x + pb.x) / 2 + (Math.random() - 0.5) * 20
          const my = (pa.y + pb.y) / 2 + (Math.random() - 0.5) * 20

          ctx.strokeStyle = `rgba(${r},${g},${bv},${alpha})`
          ctx.lineWidth = pa.scale * 1.2
          ctx.beginPath()
          ctx.moveTo(pa.x, pa.y)
          ctx.quadraticCurveTo(mx, my, pb.x, pb.y)
          ctx.stroke()
        }
      }

      // Draw pulses
      pulses = pulses.filter(p => p.progress < 1)
      pulses.forEach(p => {
        p.progress += p.speed
        const t = p.progress
        const from = project(p.fromNode.x, p.fromNode.y, p.fromNode.z, W, H)
        const to = project(p.toNode.x, p.toNode.y, p.toNode.z, W, H)
        const px = from.x + (to.x - from.x) * t
        const py = from.y + (to.y - from.y) * t

        const r = parseInt(p.color.slice(1,3),16)
        const g = parseInt(p.color.slice(3,5),16)
        const bv = parseInt(p.color.slice(5,7),16)

        const grd = ctx.createRadialGradient(px, py, 0, px, py, 10)
        grd.addColorStop(0, `rgba(${r},${g},${bv},0.6)`)
        grd.addColorStop(1, `rgba(${r},${g},${bv},0)`)
        ctx.fillStyle = grd
        ctx.fillRect(px - 10, py - 10, 20, 20)

        ctx.font = '9px "Geist Pixel Circle", monospace'
        ctx.fillStyle = `rgba(${r},${g},${bv},0.9)`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.char, px, py)
      })

      // Draw nodes
      nodes.forEach(node => {
        node.x += node.vx
        node.y += node.vy
        node.charTimer++
        if (node.charTimer > 80) { node.char = '01ABF'[Math.floor(Math.random()*5)]; node.charTimer = 0 }

        if (node.x < -20) node.x = canvas.width + 20
        if (node.x > canvas.width + 20) node.x = -20
        if (node.y < -20) node.y = canvas.height + 20
        if (node.y > canvas.height + 20) node.y = -20

        const p = project(node.x, node.y, node.z, W, H)
        const r = parseInt(node.color.slice(1,3),16)
        const g = parseInt(node.color.slice(3,5),16)
        const bv = parseInt(node.color.slice(5,7),16)

        // Node glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, node.size * 4 * p.scale)
        grd.addColorStop(0, `rgba(${r},${g},${bv},${node.opacity})`)
        grd.addColorStop(1, `rgba(${r},${g},${bv},0)`)
        ctx.fillStyle = grd
        ctx.fillRect(p.x - node.size*4, p.y - node.size*4, node.size*8, node.size*8)

        // Node char
        ctx.font = `${Math.ceil(node.size * 3 * p.scale)}px "Geist Pixel Circle", monospace`
        ctx.fillStyle = `rgba(${r},${g},${bv},${node.opacity * 1.5})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.char, p.x, p.y)
      })

      animId = requestAnimationFrame(render)
    }
    render()
    return () => { ro.disconnect(); cancelAnimationFrame(animId); clearInterval(pulseInterval) }
  }, [])

  return (
    <canvas ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }} />
  )
}
