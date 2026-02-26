
export default function MarqueeScroll({
  items = [],
  speed = 40,
  direction = 'left',
  pauseOnHover = true,
  className = '',
  style = {},
}) {
  const items2 = [...items, ...items] // Double for seamless loop

  return (
    <div
      className={className}
      style={{
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        ...style,
      }}
    >
      {/* Fade masks */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px',
        background: 'linear-gradient(to right, #000, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px',
        background: 'linear-gradient(to left, #000, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      <div
        style={{
          display: 'flex',
          gap: '32px',
          width: 'max-content',
          animation: `marquee-scroll ${speed}s linear infinite`,
          animationDirection: direction === 'right' ? 'reverse' : 'normal',
        }}
        onMouseEnter={e => { if (pauseOnHover) e.currentTarget.style.animationPlayState = 'paused' }}
        onMouseLeave={e => { if (pauseOnHover) e.currentTarget.style.animationPlayState = 'running' }}
      >
        {items2.map((item, i) => (
          <div key={i} style={{
            flexShrink: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            color: 'rgba(139,92,246,0.5)',
            padding: '6px 16px',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
          }}>
            {item}
          </div>
        ))}
      </div>

    </div>
  )
}
