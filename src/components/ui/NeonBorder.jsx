export default function NeonBorder({
  children,
  color1 = '#8b5cf6',
  color2 = '#1E88E5',
  animationType = 'half',
  duration = 6,
  borderRadius = '20px',
  style = {},
}) {
  const shouldAnimate = animationType !== 'none'

  const animWidth = animationType === 'full' ? '100%'
    : animationType === 'half' ? '50%'
    : '12%'

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
      <div
        style={{
          position: 'absolute', inset: 0,
          overflow: 'hidden', borderRadius,
          zIndex: 0, transformOrigin: 'center',
          filter: `blur(3px) drop-shadow(0 0 2px ${color1}44)`,
          animation: shouldAnimate ? `neon-spin ${duration}s linear infinite` : 'none',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: animWidth, height: '100%',
          background: `linear-gradient(135deg, ${color1}55, ${color1}33, transparent, transparent)`,
        }} />
      </div>

      <div
        style={{
          position: 'absolute', inset: 0,
          overflow: 'hidden', borderRadius,
          zIndex: 0, transformOrigin: 'center',
          filter: `blur(3px) drop-shadow(0 0 2px ${color2}44)`,
          animation: shouldAnimate ? `neon-spin ${duration}s linear infinite` : 'none',
          animationDelay: shouldAnimate ? `-${duration / 2}s` : undefined,
        }}
      >
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: animWidth, height: '100%',
          background: `linear-gradient(135deg, transparent, transparent, ${color2}33, ${color2}55)`,
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, borderRadius, height: '100%' }}>
        {children}
      </div>
    </div>
  )
}
