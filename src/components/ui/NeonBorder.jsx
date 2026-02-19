import { useEffect, useRef } from 'react'

/**
 * NeonBorder — React port of inspira-ui's NeonBorder.vue
 * Two colored neon arcs that animate around the card border.
 */
export default function NeonBorder({
  children,
  color1 = '#8b5cf6',
  color2 = '#1E88E5',
  animationType = 'half',   // 'none' | 'half' | 'full'
  duration = 6,
  borderRadius = '20px',
  style = {},
}) {
  // Stable unique ID for this instance's CSS class
  const id = useRef(`neon-${Math.random().toString(36).slice(2, 7)}`).current
  const shouldAnimate = animationType !== 'none'

  const animWidth = animationType === 'full' ? '100%'
    : animationType === 'half' ? '50%'
    : '12%'

  useEffect(() => {
    if (!shouldAnimate) return
    const css = `
      @keyframes ${id}-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      .${id}-one {
        animation: ${id}-spin ${duration}s linear infinite;
      }
      .${id}-two {
        animation: ${id}-spin ${duration}s linear infinite;
        animation-delay: -${duration / 2}s;
      }
    `
    const el = document.createElement('style')
    el.textContent = css
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [id, shouldAnimate, duration])

  return (
    <div style={{
      position: 'relative',
      display: 'block',
      overflow: 'hidden',
      borderRadius,
      padding: '1.5px',
      height: '100%',
      ...style,
    }}>
      {/* Arc 1 — top-left, color1 */}
      <div
        className={shouldAnimate ? `${id}-one` : ''}
        style={{
          position: 'absolute', inset: 0,
          overflow: 'hidden', borderRadius,
          zIndex: 0, transformOrigin: 'center',
          filter: `blur(3px) drop-shadow(0 0 2px ${color1}44)`,
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: animWidth, height: '100%',
          background: `linear-gradient(135deg, ${color1}55, ${color1}33, transparent, transparent)`,
        }} />
      </div>

      {/* Arc 2 — bottom-right, color2 */}
      <div
        className={shouldAnimate ? `${id}-two` : ''}
        style={{
          position: 'absolute', inset: 0,
          overflow: 'hidden', borderRadius,
          zIndex: 0, transformOrigin: 'center',
          filter: `blur(3px) drop-shadow(0 0 2px ${color2}44)`,
        }}
      >
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: animWidth, height: '100%',
          background: `linear-gradient(135deg, transparent, transparent, ${color2}33, ${color2}55)`,
        }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, borderRadius, height: '100%' }}>
        {children}
      </div>
    </div>
  )
}
