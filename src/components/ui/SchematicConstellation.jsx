import { useRef, useEffect, useState } from 'react'

// ─── Utilities ────────────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
function randomChar(set) { return set[Math.floor(Math.random() * set.length)] }
function lerp(a, b, t) { return a + (b - a) * t }
function dist(x1, y1, x2, y2) { return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) }
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)) }

async function waitForGeistFonts() {
  if (!document.fonts) return
  try {
    await Promise.all([
      document.fonts.load('16px "Geist Pixel Square"'),
      document.fonts.load('16px "Geist Pixel Circle"'),
    ])
  } catch { /* already loaded */ }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useAnimationFrame(callback, enabled = true) {
  const cbRef = useRef(callback)
  cbRef.current = callback
  useEffect(() => {
    if (!enabled) return
    let rafId
    let lastTime = performance.now()
    const loop = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      cbRef.current(dt)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [enabled])
}

function useCanvasSetup(canvasRef, onResize) {
  const ctxRef = useRef(null)
  const sizeRef = useRef({ width: 0, height: 0 })
  const onResizeRef = useRef(onResize)
  onResizeRef.current = onResize

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    ctxRef.current = ctx

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { width: rect.width, height: rect.height }
      onResizeRef.current?.(rect.width, rect.height)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas.parentElement)
    return () => observer.disconnect()
  }, [canvasRef])

  return { ctxRef, sizeRef }
}

function useMousePosition(throttleMs = 16) {
  const posRef = useRef({ x: -9999, y: -9999 })
  useEffect(() => {
    let lastUpdate = 0
    const handler = (e) => {
      const now = performance.now()
      if (now - lastUpdate < throttleMs) return
      lastUpdate = now
      posRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [throttleMs])
  return posRef
}

// ─── Constants ────────────────────────────────────────────────────────────────
const FONTS = { square: 'Geist Pixel Square', circle: 'Geist Pixel Circle' }
const CHARS = { digits: '0123456789', hex: '0123456789ABCDEF' }
const C = {
  bg: '#000000',
  mist: '#aab4c8',
  aether: '#7ee7ff',
  signal: '#8b5dff',
}

const CELL_W = 48, CELL_H = 48
const COLS = 24, ROWS = 18
const PULSE_SPEED = 1.5
const BASE_ALPHA = 0.3, HOVER_ALPHA = 0.85, ACTIVE_ALPHA = 1.0
const EDGE_BASE = 0.12, EDGE_HOVER = 0.35
const GLOW_R = 20, TRAIL = 0.06, GRID_LINE = 0.04
const MOUSE_R = 150

function gridToIso(gx, gy) {
  return { x: (gx - gy) * CELL_W * 0.5, y: (gx + gy) * CELL_H * 0.25 }
}
function manhattanDist(x1, y1, x2, y2) { return Math.abs(x1 - x2) + Math.abs(y1 - y2) }

// ─── Component ────────────────────────────────────────────────────────────────
export default function SchematicConstellation({ className = '', style = {} }) {
  const canvasRef = useRef(null)
  const mousePos = useMousePosition(16)
  const nodesRef = useRef([])
  const edgesRef = useRef([])
  const pulsesRef = useRef([])
  const lastActivationRef = useRef(0)
  const nextDelayRef = useRef(1000)
  const fontsLoadedRef = useRef(false)
  const [, setReady] = useState(false)
  const offsetRef = useRef({ x: 0, y: 0 })

  const { ctxRef, sizeRef } = useCanvasSetup(canvasRef, (w, h) => initGrid(w, h))

  function initGrid(w, h) {
    const nodes = []
    offsetRef.current = { x: w / 2, y: h / 2 - ROWS * CELL_H * 0.125 }

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const { x, y } = gridToIso(col, row)
        nodes.push({
          gridX: col, gridY: row, isoX: x, isoY: y,
          char: randomChar(CHARS.digits),
          brightness: BASE_ALPHA, targetBrightness: BASE_ALPHA,
          isActive: false, activationTime: 0, lastCharUpdate: 0,
        })
      }
    }
    nodesRef.current = nodes

    const edges = [], edgeSet = new Set()
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const candidates = []
      for (let j = 0; j < nodes.length; j++) {
        if (i !== j && manhattanDist(node.gridX, node.gridY, nodes[j].gridX, nodes[j].gridY) <= 2)
          candidates.push(j)
      }
      const numConn = Math.floor(Math.random() * 3) + 2
      for (let k = 0; k < numConn && candidates.length > 0; k++) {
        const idx = Math.floor(Math.random() * candidates.length)
        const tgt = candidates.splice(idx, 1)[0]
        const k1 = `${i}-${tgt}`, k2 = `${tgt}-${i}`
        if (!edgeSet.has(k1) && !edgeSet.has(k2)) {
          edges.push({ from: i, to: tgt, isVisible: Math.random() < 0.4, alpha: EDGE_BASE })
          edgeSet.add(k1)
        }
      }
    }
    edgesRef.current = edges
    pulsesRef.current = []
  }

  useEffect(() => {
    waitForGeistFonts().then(() => {
      fontsLoadedRef.current = true
      setReady(true)
      if (sizeRef.current.width > 0) initGrid(sizeRef.current.width, sizeRef.current.height)
    })
  }, [])

  useAnimationFrame((dt) => {
    if (!fontsLoadedRef.current) return
    const ctx = ctxRef.current
    if (!ctx) return
    const { width, height } = sizeRef.current
    const time = performance.now()
    const { x: ox, y: oy } = offsetRef.current

    // Trail clear
    ctx.fillStyle = hexToRgba(C.bg, TRAIL)
    ctx.fillRect(0, 0, width, height)

    // Background iso grid
    ctx.strokeStyle = hexToRgba(C.mist, GRID_LINE)
    ctx.lineWidth = 1
    ctx.setLineDash([4, 8])
    for (let row = -2; row <= ROWS + 2; row++) {
      const s = gridToIso(0, row), e = gridToIso(COLS - 1, row)
      ctx.beginPath()
      ctx.moveTo(ox + s.x, oy + s.y)
      ctx.lineTo(ox + e.x, oy + e.y)
      ctx.stroke()
    }
    for (let col = -2; col <= COLS + 2; col++) {
      const s = gridToIso(col, 0), e = gridToIso(col, ROWS - 1)
      ctx.beginPath()
      ctx.moveTo(ox + s.x, oy + s.y)
      ctx.lineTo(ox + e.x, oy + e.y)
      ctx.stroke()
    }
    ctx.setLineDash([])

    const nodes = nodesRef.current
    const mx = mousePos.current.x, my = mousePos.current.y

    // Update nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      const sx = ox + n.isoX, sy = oy + n.isoY
      const md = dist(mx, my, sx, sy)
      const mi = clamp(1 - md / MOUSE_R, 0, 1)
      if (mi > 0.1) n.targetBrightness = lerp(BASE_ALPHA, HOVER_ALPHA, mi)
      else if (!n.isActive) n.targetBrightness = BASE_ALPHA
      n.brightness = lerp(n.brightness, n.targetBrightness, 0.08)
      if (n.isActive && time - n.activationTime > 600) { n.isActive = false; n.targetBrightness = BASE_ALPHA }
      if (n.isActive && time - n.lastCharUpdate > 400) { n.char = randomChar(CHARS.digits); n.lastCharUpdate = time }
    }

    const edges = edgesRef.current
    // Update & draw edges
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i]
      const fn = nodes[e.from], tn = nodes[e.to]
      const fx = ox + fn.isoX, fy = oy + fn.isoY
      const tx = ox + tn.isoX, ty = oy + tn.isoY
      const md = Math.min(dist(mx, my, fx, fy), dist(mx, my, tx, ty))
      const mi = clamp(1 - md / MOUSE_R, 0, 1)
      if (mi > 0.1 || e.isVisible) {
        e.alpha = lerp(e.alpha, mi > 0.1 ? lerp(EDGE_BASE, EDGE_HOVER, mi) : EDGE_BASE, 0.1)
      } else {
        e.alpha = lerp(e.alpha, 0, 0.05)
      }
      if (e.alpha < 0.01) continue
      ctx.strokeStyle = hexToRgba(C.mist, e.alpha)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(fx, fy)
      ctx.lineTo(tx, ty)
      ctx.stroke()
    }

    // Update & draw pulses
    const pulses = pulsesRef.current
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i]
      p.progress += p.speed * dt
      if (p.progress >= 1.0) {
        const tn = nodes[edges[p.edgeIndex].to]
        tn.targetBrightness = ACTIVE_ALPHA
        tn.isActive = true
        tn.activationTime = time
        pulses.splice(i, 1)
        continue
      }
      const e = edges[p.edgeIndex]
      const fn = nodes[e.from], tn = nodes[e.to]
      const px = ox + lerp(fn.isoX, tn.isoX, p.progress)
      const py = oy + lerp(fn.isoY, tn.isoY, p.progress)
      const g = ctx.createRadialGradient(px, py, 0, px, py, GLOW_R)
      g.addColorStop(0, hexToRgba(C.aether, 0.4 * p.intensity))
      g.addColorStop(0.5, hexToRgba(C.aether, 0.15 * p.intensity))
      g.addColorStop(1, hexToRgba(C.aether, 0))
      ctx.fillStyle = g
      ctx.fillRect(px - GLOW_R, py - GLOW_R, GLOW_R * 2, GLOW_R * 2)
      ctx.font = `10px "${FONTS.circle}"`
      ctx.fillStyle = hexToRgba(C.aether, 0.9 * p.intensity)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(p.char, px, py)
      p.intensity *= 0.995
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      const sx = ox + n.isoX, sy = oy + n.isoY
      if (n.isActive) {
        const gg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 16)
        gg.addColorStop(0, hexToRgba(C.signal, 0.3))
        gg.addColorStop(0.6, hexToRgba(C.signal, 0.1))
        gg.addColorStop(1, hexToRgba(C.signal, 0))
        ctx.fillStyle = gg
        ctx.fillRect(sx - 16, sy - 16, 32, 32)
      }
      ctx.font = `14px "${FONTS.circle}"`
      ctx.fillStyle = hexToRgba(n.isActive ? C.signal : C.mist, n.brightness)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(n.char, sx, sy)
    }

    // Periodic node activation
    if (time - lastActivationRef.current > nextDelayRef.current) {
      const candidates = nodes.map((_, idx) => idx).filter(idx =>
        edges.some(e => e.from === idx || e.to === idx)
      )
      if (candidates.length > 0) {
        const ni = candidates[Math.floor(Math.random() * candidates.length)]
        const n = nodes[ni]
        n.isActive = true; n.activationTime = time
        n.targetBrightness = ACTIVE_ALPHA
        n.char = randomChar(CHARS.digits); n.lastCharUpdate = time
        const conn = edges.map((e, idx) => ({ e, idx })).filter(({ e }) => e.from === ni || e.to === ni)
        if (conn.length > 0 && pulses.length < 100) {
          const np = Math.min(conn.length, Math.random() < 0.6 ? 1 : 2)
          for (let k = 0; k < np; k++) {
            const { idx } = conn[Math.floor(Math.random() * conn.length)]
            pulses.push({ edgeIndex: idx, progress: 0, speed: PULSE_SPEED * (0.8 + Math.random() * 0.4), char: randomChar(CHARS.hex), intensity: 1.0 })
          }
        }
      }
      lastActivationRef.current = time
      nextDelayRef.current = 800 + Math.random() * 700
    }
  }, true)

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }}
    />
  )
}
