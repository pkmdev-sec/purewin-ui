import { useEffect, useRef } from 'react'

// Draws 3D shapes in a pixel-art (8-bit) style using Canvas 2D
// Low-res rendering then scaled up = pixel look

const SHAPES = [
  { type: 'cube', x: 0.15, y: 0.2, size: 40, color: '#1a3a1a', rotSpeedX: 0.008, rotSpeedY: 0.012 },
  { type: 'cube', x: 0.8, y: 0.7, size: 55, color: '#0a1e3a', rotSpeedX: 0.006, rotSpeedY: 0.009 },
  { type: 'cube', x: 0.5, y: 0.85, size: 35, color: '#1a1a2e', rotSpeedX: 0.01, rotSpeedY: 0.007 },
  { type: 'diamond', x: 0.9, y: 0.15, size: 30, color: '#1a2a1a', rotSpeedX: 0.012, rotSpeedY: 0.008 },
  { type: 'diamond', x: 0.05, y: 0.75, size: 45, color: '#0a2030', rotSpeedX: 0.007, rotSpeedY: 0.015 },
]

function rotatePoint(x, y, z, rx, ry) {
  // Rotate around X
  let y1 = y * Math.cos(rx) - z * Math.sin(rx)
  let z1 = y * Math.sin(rx) + z * Math.cos(rx)
  // Rotate around Y
  let x1 = x * Math.cos(ry) + z1 * Math.sin(ry)
  let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry)
  return [x1, y1, z2]
}

function project(x, y, z, cx, cy, fov = 200) {
  const scale = fov / (fov + z)
  return [cx + x * scale, cy + y * scale, scale]
}

function drawPixelCube(ctx, cx, cy, size, color, rx, ry) {
  const s = size
  const verts = [
    [-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],
    [-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]
  ]
  const edges = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7]
  ]
  const projected = verts.map(([x, y, z]) => {
    const [rx1, ry1, rz1] = rotatePoint(x, y, z, rx, ry)
    return project(rx1, ry1, rz1, cx, cy, 180)
  })

  const r = parseInt(color.slice(1,3),16)
  const g = parseInt(color.slice(3,5),16)
  const b = parseInt(color.slice(5,7),16)

  ctx.strokeStyle = `rgba(${r},${g},${b},0.6)`
  ctx.lineWidth = 2
  edges.forEach(([a, b_]) => {
    ctx.beginPath()
    ctx.moveTo(Math.round(projected[a][0]), Math.round(projected[a][1]))
    ctx.lineTo(Math.round(projected[b_][0]), Math.round(projected[b_][1]))
    ctx.stroke()
  })

  // Pixel dots at vertices
  ctx.fillStyle = `rgba(${r},${g},${b},0.8)`
  projected.forEach(([px, py]) => {
    ctx.fillRect(Math.round(px)-2, Math.round(py)-2, 4, 4)
  })
}

function drawPixelDiamond(ctx, cx, cy, size, color, rx, ry) {
  const s = size
  const verts = [
    [0,-s*1.5,0],[s,0,0],[-s,0,0],[0,s*1.5,0],[0,0,s],[0,0,-s]
  ]
  const edges = [[0,1],[0,2],[0,4],[0,5],[3,1],[3,2],[3,4],[3,5],[1,4],[1,5],[2,4],[2,5]]

  const projected = verts.map(([x, y, z]) => {
    const [rx1, ry1, rz1] = rotatePoint(x, y, z, rx, ry)
    return project(rx1, ry1, rz1, cx, cy, 180)
  })

  const r = parseInt(color.slice(1,3),16)
  const g = parseInt(color.slice(3,5),16)
  const b = parseInt(color.slice(5,7),16)

  ctx.strokeStyle = `rgba(${r},${g},${b},0.5)`
  ctx.lineWidth = 2
  edges.forEach(([a, b_]) => {
    ctx.beginPath()
    ctx.moveTo(Math.round(projected[a][0]), Math.round(projected[a][1]))
    ctx.lineTo(Math.round(projected[b_][0]), Math.round(projected[b_][1]))
    ctx.stroke()
  })
}

export default function PixelGeometry() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Low-res canvas for pixel look
    const SCALE = 3 // render at 1/3 res, display scaled
    let animId
    let W, H

    function resize() {
      W = Math.floor(window.innerWidth / SCALE)
      H = Math.floor(window.innerHeight / SCALE)
      canvas.width = W
      canvas.height = H
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      canvas.style.imageRendering = 'pixelated'
    }
    resize()
    window.addEventListener('resize', resize)

    const rotations = SHAPES.map(() => ({ rx: Math.random() * Math.PI * 2, ry: Math.random() * Math.PI * 2 }))

    function render() {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, W, H)

      SHAPES.forEach((shape, i) => {
        rotations[i].rx += shape.rotSpeedX
        rotations[i].ry += shape.rotSpeedY

        const cx = shape.x * W
        const cy = shape.y * H
        const s = Math.floor(shape.size / SCALE)

        if (shape.type === 'cube') {
          drawPixelCube(ctx, cx, cy, s, shape.color, rotations[i].rx, rotations[i].ry)
        } else {
          drawPixelDiamond(ctx, cx, cy, s, shape.color, rotations[i].rx, rotations[i].ry)
        }
      })

      animId = requestAnimationFrame(render)
    }
    render()

    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        zIndex: 2, pointerEvents: 'none',
        opacity: 0.4,
        imageRendering: 'pixelated',
      }}
    />
  )
}
