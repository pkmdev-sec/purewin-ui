import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function MagneticButton({
  children,
  onClick,
  href,
  variant = 'solid',
  style = {},
}) {
  const btnRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 })
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 })

  function handleMouseMove(e) {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * 0.5)
    y.set((e.clientY - centerY) * 0.5)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  const isSolid = variant === 'solid'

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    fontFamily: 'var(--font-pixel-triangle)',
    fontSize: '0.9rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    borderRadius: '6px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.2s, border-color 0.2s',
    ...(isSolid
      ? {
          backgroundColor: 'var(--xp-green)',
          color: '#fff',
          border: '1px solid var(--xp-green)', /* xp-green now purple */
        }
      : {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid rgba(255,255,255,0.2)',
        }),
    ...style,
  }

  const Component = href ? motion.a : motion.button

  return (
    <Component
      ref={btnRef}
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...baseStyle, x: springX, y: springY }}
      whileHover={{
        scale: 1.04,
        ...(isSolid
          ? { backgroundColor: '#6d28d9' }
          : { borderColor: 'rgba(255,255,255,0.5)' }),
      }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </Component>
  )
}
