import { useRef, useCallback } from 'react'

export default function GlareCard({ children, style = {} }) {
  const outerRef = useRef(null)
  const tiltRef = useRef(null)
  const glareRef = useRef(null)
  const foilRef = useRef(null)
  const topEdgeRef = useRef(null)
  const hoverRef = useRef(false)

  const STEP = '5%'

  const applyStyles = useCallback((mx, my, bgX, bgY, rx, ry, hover) => {
    const glareOpacity = hover ? 0.04 : 0.01
    const foilOpacity = hover ? 0.08 : 0.03

    if (tiltRef.current) {
      tiltRef.current.style.transform = `rotateY(${rx}deg) rotateX(${ry}deg)`
      tiltRef.current.style.borderColor = `rgba(139,92,246,${hover ? 0.35 : 0.18})`
      tiltRef.current.style.boxShadow = hover
        ? '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.15)'
        : '0 4px 24px rgba(0,0,0,0.4)'
      tiltRef.current.style.transition = hover
        ? 'transform 150ms linear, border-color 200ms, box-shadow 200ms'
        : 'transform 400ms ease, border-color 400ms, box-shadow 400ms'
    }
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(ellipse 80% 60% at ${mx}% ${my}%, rgba(255,255,255,${glareOpacity * 2.5}) 0%, rgba(255,255,255,${glareOpacity}) 35%, transparent 70%)`
    }
    if (foilRef.current) {
      foilRef.current.style.opacity = foilOpacity
      foilRef.current.style.background = [
        `repeating-linear-gradient(0deg, rgb(255,119,115) calc(${STEP} * 1), rgba(255,237,95,1) calc(${STEP} * 2), rgba(168,255,95,1) calc(${STEP} * 3), rgba(131,255,247,1) calc(${STEP} * 4), rgba(120,148,255,1) calc(${STEP} * 5), rgb(216,117,255) calc(${STEP} * 6), rgb(255,119,115) calc(${STEP} * 7)) 0% ${bgY}% / 200% 700% no-repeat`,
        `repeating-linear-gradient(128deg, #0e152e 0%, hsl(180,10%,60%) 4.5%, #0e152e 10%, #0e152e 12%) ${bgX}% ${bgY}% / 300% no-repeat`,
        `radial-gradient(farthest-corner circle at ${mx}% ${my}%, rgba(255,255,255,0.12) 12%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0) 90%) ${bgX}% ${bgY}% / 300% no-repeat`,
      ].join(', ')
    }
    if (topEdgeRef.current) {
      topEdgeRef.current.style.background = `linear-gradient(90deg, transparent, rgba(139,92,246,${hover ? 0.7 : 0.3}), transparent)`
    }
  }, [])

  const handlePointerMove = useCallback((e) => {
    const rect = outerRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = ((e.clientX - rect.left) / rect.width) * 100
    const py = ((e.clientY - rect.top) / rect.height) * 100
    const bgX = 50 + px / 4 - 12.5
    const bgY = 50 + py / 3 - 16.67
    const rx = -((px - 50) / 3.5) * 0.4
    const ry = ((py - 50) / 2) * 0.4
    applyStyles(px, py, bgX, bgY, rx, ry, hoverRef.current)
  }, [applyStyles])

  const handlePointerEnter = useCallback(() => {
    hoverRef.current = true
    applyStyles(28, 32, 55, 45, 0, 0, true)
  }, [applyStyles])

  const handlePointerLeave = useCallback(() => {
    hoverRef.current = false
    applyStyles(28, 32, 55, 45, 0, 0, false)
  }, [applyStyles])

  return (
    <div
      ref={outerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{ perspective: '700px', height: '100%', ...style }}
    >
      <div
        ref={tiltRef}
        style={{
          height: '100%',
          transform: 'rotateY(0deg) rotateX(0deg)',
          willChange: 'transform',
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(145deg, rgba(14,8,32,0.45) 0%, rgba(8,4,20,0.52) 100%)',
          border: '1px solid rgba(139,92,246,0.18)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          transition: 'transform 400ms ease, border-color 400ms, box-shadow 400ms',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          {children}
        </div>

        <div
          ref={glareRef}
          style={{
            position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
            borderRadius: '20px',
            background: 'radial-gradient(ellipse 80% 60% at 28% 32%, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 35%, transparent 70%)',
            transition: 'background 80ms linear',
          }}
        />

        <div
          ref={foilRef}
          style={{
            position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
            borderRadius: '20px',
            opacity: 0.03,
            mixBlendMode: 'color-dodge',
            transition: 'opacity 300ms ease',
          }}
        />

        <div
          ref={topEdgeRef}
          style={{
            position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
            zIndex: 2, pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
            transition: 'all 300ms ease',
          }}
        />
      </div>
    </div>
  )
}
