import { useEffect, useRef } from 'react'

export default function BorderBeam({ duration = 3, size = 120, color = '#8b5cf6' }) {
  const beamRef = useRef(null)

  useEffect(() => {
    if (!beamRef.current) return

    const style = document.createElement('style')
    const id = `border-beam-${Math.random().toString(36).slice(2, 8)}`

    style.textContent = `
      @keyframes ${id} {
        0% { offset-distance: 0%; }
        100% { offset-distance: 100%; }
      }
    `
    document.head.appendChild(style)

    beamRef.current.style.animation = `${id} ${duration}s linear infinite`

    return () => {
      document.head.removeChild(style)
    }
  }, [duration])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        borderRadius: 'inherit',
        overflow: 'hidden',
      }}
    >
      <div
        ref={beamRef}
        style={{
          position: 'absolute',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: 0.6,
          offsetPath: `rect(0% 100% 100% 0% round 12px)`,
          offsetRotate: '0deg',
          filter: `blur(${size / 4}px)`,
        }}
      />
    </div>
  )
}
