/**
 * Meteors — React port of inspira-ui's Meteors.vue
 * Animated diagonal shooting stars/meteors
 */
export default function Meteors({ count = 20, color = '#8b5cf6', style = {} }) {
  const meteors = Array.from({ length: count }, (_, i) => ({
    key: i,
    left: `${Math.floor(Math.random() * 800) - 400}px`,
    delay: `${(Math.random() * 0.8 + 0.2).toFixed(2)}s`,
    duration: `${Math.floor(Math.random() * 8 + 3)}s`,
    top: `${Math.floor(Math.random() * 80)}%`,
  }))

  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflow: 'hidden', pointerEvents: 'none',
      zIndex: 0,
      ...style,
    }}>
      {meteors.map(m => (
        <span
          key={m.key}
          style={{
            animation: `meteor-fall linear infinite`,
            animationDelay: m.delay,
            animationDuration: m.duration,
            position: 'absolute',
            height: '1px',
            width: '1px',
            borderRadius: '9999px',
            background: `${color}80`,
            boxShadow: `0 0 0 1px ${color}15`,
            top: m.top,
            left: m.left,
          }}
        >
          <span style={{ position: 'absolute', top: '50%', left: 0, height: '1px', width: '60px', transform: 'translateY(-50%)', background: `linear-gradient(to right, ${color}90, transparent)`, pointerEvents: 'none' }} />
        </span>
      ))}
    </div>
  )
}
