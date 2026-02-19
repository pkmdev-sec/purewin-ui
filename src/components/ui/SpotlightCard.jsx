import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function SpotlightCard({ children, style = {}, accentColor = '#4CAF50' }) {
  const cardRef = useRef(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  function handleMouseMove(e) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const r = parseInt(accentColor.slice(1,3),16) || 76
  const g = parseInt(accentColor.slice(3,5),16) || 175
  const b = parseInt(accentColor.slice(5,7),16) || 80

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: hovered
          ? `linear-gradient(135deg, rgba(${r},${g},${b},0.06) 0%, rgba(10,14,22,0.95) 100%)`
          : 'rgba(8,12,20,0.92)',
        border: `1px solid ${hovered ? `rgba(${r},${g},${b},0.35)` : 'rgba(255,255,255,0.07)'}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: hovered
          ? `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(${r},${g},${b},0.15), inset 0 1px 0 rgba(255,255,255,0.06)`
          : '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
    >
      {/* Spotlight */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: hovered
          ? `radial-gradient(300px circle at ${mouse.x}px ${mouse.y}px, rgba(${r},${g},${b},0.07), transparent 70%)`
          : 'none',
        transition: 'opacity 0.3s',
      }} />

      {/* Top edge highlight */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
        background: `linear-gradient(90deg, transparent, rgba(${r},${g},${b},${hovered ? 0.6 : 0.2}), transparent)`,
        transition: 'all 0.3s',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </motion.div>
  )
}
