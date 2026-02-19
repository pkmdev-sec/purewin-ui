import { useRef, useState, useCallback } from 'react'

/**
 * GlareCard v3 — reliable on any background
 * Uses position:absolute overlays (no blend-mode on base) so the
 * glare/foil effects are visible against both dark and silk backgrounds.
 */
export default function GlareCard({ children, style = {} }) {
  const ref = useRef(null)
  const [state, setState] = useState({
    mx: 28, my: 32,          // mouse % in card — rest position
    bgX: 55, bgY: 45,
    rx: 0, ry: 0,
    hover: false,
  })

  const handlePointerMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = ((e.clientX - rect.left) / rect.width) * 100
    const py = ((e.clientY - rect.top) / rect.height) * 100
    setState(s => ({
      ...s,
      mx: px, my: py,
      bgX: 50 + px / 4 - 12.5,
      bgY: 50 + py / 3 - 16.67,
      rx: -((px - 50) / 3.5) * 0.4,
      ry: ((py - 50) / 2) * 0.4,
    }))
  }, [])

  const handlePointerEnter = useCallback(() => setState(s => ({ ...s, hover: true })), [])
  const handlePointerLeave = useCallback(() => setState({
    mx: 28, my: 32, bgX: 55, bgY: 45, rx: 0, ry: 0, hover: false,
  }), [])

  const { mx, my, bgX, bgY, rx, ry, hover } = state
  const STEP = '5%'
  const glareOpacity = hover ? 0.04 : 0.01
  const foilOpacity  = hover ? 0.08 : 0.03

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{ perspective: '700px', height: '100%', ...style }}
    >
      {/* 3D tilt container */}
      <div style={{
        height: '100%',
        transform: `rotateY(${rx}deg) rotateX(${ry}deg)`,
        transition: hover ? 'transform 150ms linear' : 'transform 400ms ease',
        willChange: 'transform',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        // Semi-transparent — see-through with blur
        background: 'linear-gradient(145deg, rgba(14,8,32,0.45) 0%, rgba(8,4,20,0.52) 100%)',
        border: `1px solid rgba(139,92,246,${hover ? 0.35 : 0.18})`,
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        boxShadow: hover
          ? '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.15)'
          : '0 4px 24px rgba(0,0,0,0.4)',
        transition: hover
          ? 'transform 150ms linear, border-color 200ms, box-shadow 200ms'
          : 'transform 400ms ease, border-color 400ms, box-shadow 400ms',
      }}>

        {/* Content — z-index 1 so it's above the overlay layers */}
        <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          {children}
        </div>

        {/* White radial glare following mouse */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          borderRadius: '20px',
          background: `radial-gradient(
            ellipse 80% 60% at ${mx}% ${my}%,
            rgba(255,255,255,${glareOpacity * 2.5}) 0%,
            rgba(255,255,255,${glareOpacity}) 35%,
            transparent 70%
          )`,
          transition: 'background 80ms linear',
        }} />

        {/* Rainbow holographic foil */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          borderRadius: '20px',
          opacity: foilOpacity,
          background: [
            `repeating-linear-gradient(0deg,
              rgb(255,119,115) calc(${STEP} * 1),
              rgba(255,237,95,1) calc(${STEP} * 2),
              rgba(168,255,95,1) calc(${STEP} * 3),
              rgba(131,255,247,1) calc(${STEP} * 4),
              rgba(120,148,255,1) calc(${STEP} * 5),
              rgb(216,117,255) calc(${STEP} * 6),
              rgb(255,119,115) calc(${STEP} * 7)
            ) 0% ${bgY}% / 200% 700% no-repeat`,
            `repeating-linear-gradient(128deg,
              #0e152e 0%, hsl(180,10%,60%) 4.5%, #0e152e 10%, #0e152e 12%
            ) ${bgX}% ${bgY}% / 300% no-repeat`,
            `radial-gradient(farthest-corner circle at ${mx}% ${my}%,
              rgba(255,255,255,0.12) 12%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0) 90%
            ) ${bgX}% ${bgY}% / 300% no-repeat`,
          ].join(', '),
          mixBlendMode: 'color-dodge',
          transition: 'opacity 300ms ease',
        }} />

        {/* Top-edge purple highlight */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
          zIndex: 2, pointerEvents: 'none',
          background: `linear-gradient(90deg, transparent, rgba(139,92,246,${hover ? 0.7 : 0.3}), transparent)`,
          transition: 'all 300ms ease',
        }} />
      </div>
    </div>
  )
}
