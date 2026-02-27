import { useEffect, useRef, useState } from 'react'

function randomInRange(min, max) { return Math.random() * (max - min) + min }

export default function SparklesText({
  text,
  sparkleColor = '#8b5cf6',
  sparkleCount = 8,
  style = {},
  className = '',
}) {
  const [sparkles, setSparkles] = useState([])
  const counterRef = useRef(0)
  const containerRef = useRef(null)
  const visibleRef = useRef(false)

  function createSparkle() {
    return {
      id: counterRef.current++,
      createdAt: Date.now(),
      color: sparkleColor,
      size: Math.floor(randomInRange(10, 20)),
      style: {
        top: `${randomInRange(-20, 80)}%`,
        left: `${randomInRange(-10, 110)}%`,
        zIndex: 2,
      },
    }
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Pre-create sparkle pool
    const pool = Array.from({ length: sparkleCount }, () => createSparkle())
    setSparkles(pool)

    const interval = setInterval(() => {
      if (!visibleRef.current) return
      setSparkles(prev => prev.map(s => {
        if (Date.now() - s.createdAt > 900) {
          return createSparkle()  // recycle expired sparkle
        }
        return s
      }))
    }, 250)
    return () => clearInterval(interval)
  }, [sparkleColor, sparkleCount])

  return (
    <span ref={containerRef} className={className} style={{ position: 'relative', display: 'inline-block', ...style }}>
      {sparkles.map(s => (
        <span
          key={s.id}
          style={{
            position: 'absolute',
            display: 'block',
            pointerEvents: 'none',
            zIndex: 2,
            animation: 'sparkle-fade 900ms ease forwards',
            ...s.style,
          }}
        >
          <svg
            width={s.size}
            height={s.size}
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z" fill={s.color} />
          </svg>
        </span>
      ))}
      <strong style={{ fontWeight: 'inherit', position: 'relative', zIndex: 1 }}>{text}</strong>
    </span>
  )
}
