import { useEffect, useRef } from 'react'

const ORBIT_COLORS = ['#8b5cf6', '#1E88E5', '#00ffd5', '#b18cff', '#f08b47']

export default function SignalOrbit({ style = {} }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const ORBIT_COUNT = 5
    // Each orbit: ellipses with different radii/tilt
    const orbits = Array.from({ length: ORBIT_COUNT }, (_, i) => ({
      rx: 80 + i * 60,   // x radius
      ry: 30 + i * 22,   // y radius (perspective flatten)
      tilt: Math.PI * 0.08 * i, // slight rotation
      color: ORBIT_COLORS[i],
      speed: 0.003 - i * 0.0003, // outer orbits slower
      packets: Array.from({ length: 2 + i }, () => ({
        angle: Math.random() * Math.PI * 2,
        char: '01ABEF'[Math.floor(Math.random() * 6)],
        charTimer: 0,
      }))
    }))

    let t = 0

    function render() {
      t += 0.016
      const W = canvas.width, H = canvas.height
      const cx = W / 2, cy = H / 2

      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.fillRect(0, 0, W, H)

      // Central core pulse
      const corePulse = 0.6 + Math.sin(t * 2.5) * 0.25
      for (let ring = 3; ring >= 1; ring--) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, ring * 12 * corePulse)
        grad.addColorStop(0, `rgba(139,92,246,${0.15 / ring})`)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, ring * 12 * corePulse, 0, Math.PI * 2)
        ctx.fill()
      }

      // Core symbol
      ctx.font = '12px "Geist Pixel Square", monospace'
      ctx.fillStyle = `rgba(139,92,246,${corePulse})`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('\u25C8', cx, cy)

      orbits.forEach(orbit => {
        // Draw orbit ellipse (dashed)
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(orbit.tilt)
        ctx.beginPath()
        ctx.setLineDash([4, 8])
        // hex to rgba for stroke
        const sr = parseInt(orbit.color.slice(1,3),16)
        const sg = parseInt(orbit.color.slice(3,5),16)
        const sb = parseInt(orbit.color.slice(5,7),16)
        ctx.strokeStyle = `rgba(${sr},${sg},${sb},0.18)`
        ctx.lineWidth = 1
        ctx.ellipse(0, 0, orbit.rx, orbit.ry, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()

        // Update and draw packets
        orbit.packets.forEach(packet => {
          packet.angle += orbit.speed

          // Position on ellipse
          const px = cx + Math.cos(packet.angle + orbit.tilt) * orbit.rx
          const py = cy + Math.sin(packet.angle + orbit.tilt) * orbit.ry

          // Glow
          const hexColor = orbit.color
          const r = parseInt(hexColor.slice(1,3),16)
          const g = parseInt(hexColor.slice(3,5),16)
          const b = parseInt(hexColor.slice(5,7),16)

          const grd = ctx.createRadialGradient(px, py, 0, px, py, 16)
          grd.addColorStop(0, `rgba(${r},${g},${b},0.5)`)
          grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.fillStyle = grd
          ctx.fillRect(px - 16, py - 16, 32, 32)

          // Char
          packet.charTimer++
          if (packet.charTimer > 30) { packet.char = '01ABEF'[Math.floor(Math.random()*6)]; packet.charTimer = 0 }
          ctx.font = '11px "Geist Pixel Circle", monospace'
          ctx.fillStyle = `rgba(${r},${g},${b},0.9)`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(packet.char, px, py)

          // Trail
          for (let trail = 1; trail <= 5; trail++) {
            const ta = packet.angle - orbit.speed * trail * 4
            const tx = cx + Math.cos(ta + orbit.tilt) * orbit.rx
            const ty = cy + Math.sin(ta + orbit.tilt) * orbit.ry
            ctx.fillStyle = `rgba(${r},${g},${b},${0.12 / trail})`
            ctx.beginPath()
            ctx.arc(tx, ty, 2.5 / trail, 0, Math.PI * 2)
            ctx.fill()
          }
        })
      })

      // Connection lines between packets on different orbits that align
      for (let i = 0; i < orbits.length - 1; i++) {
        for (let j = i + 1; j < orbits.length; j++) {
          orbits[i].packets.forEach(p1 => {
            orbits[j].packets.forEach(p2 => {
              const angleDiff = Math.abs(((p1.angle - p2.angle + Math.PI) % (Math.PI * 2)) - Math.PI)
              if (angleDiff < 0.15) {
                const px1 = cx + Math.cos(p1.angle + orbits[i].tilt) * orbits[i].rx
                const py1 = cy + Math.sin(p1.angle + orbits[i].tilt) * orbits[i].ry
                const px2 = cx + Math.cos(p2.angle + orbits[j].tilt) * orbits[j].rx
                const py2 = cy + Math.sin(p2.angle + orbits[j].tilt) * orbits[j].ry
                const alpha = (0.15 - angleDiff) / 0.15
                ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.35})`
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(px1, py1)
                ctx.lineTo(px2, py2)
                ctx.stroke()
              }
            })
          })
        }
      }

      animId = requestAnimationFrame(render)
    }
    render()
    return () => { ro.disconnect(); cancelAnimationFrame(animId) }
  }, [])

  return (
    <canvas ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }} />
  )
}
