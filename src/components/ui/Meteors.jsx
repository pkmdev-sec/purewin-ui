import { useEffect, useRef } from 'react'

/**
 * Meteors — React port of inspira-ui's Meteors.vue
 * Animated diagonal shooting stars/meteors
 */
export default function Meteors({ count = 20, color = '#8b5cf6', style = {} }) {
  const styleRef = useRef(null)
  const cssId = useRef(`meteor-${Math.random().toString(36).slice(2, 6)}`).current

  useEffect(() => {
    const css = `
      @keyframes ${cssId}-fall {
        0% { transform: rotate(215deg) translateX(0); opacity: 1; }
        70% { opacity: 1; }
        100% { transform: rotate(215deg) translateX(-500px); opacity: 0; }
      }
      .${cssId}-meteor {
        animation: ${cssId}-fall linear infinite;
        position: absolute;
        height: 1px;
        width: 1px;
        border-radius: 9999px;
        background: ${color}80;
        box-shadow: 0 0 0 1px ${color}15;
        top: 0;
      }
      .${cssId}-meteor::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        height: 1px;
        width: 60px;
        transform: translateY(-50%);
        background: linear-gradient(to right, ${color}90, transparent);
      }
    `
    const el = document.createElement('style')
    el.textContent = css
    document.head.appendChild(el)
    styleRef.current = el
    return () => document.head.removeChild(el)
  }, [cssId, color])

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
          className={`${cssId}-meteor`}
          style={{
            left: m.left,
            top: m.top,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        />
      ))}
    </div>
  )
}
