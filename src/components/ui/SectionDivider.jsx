import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function SectionDivider({
  color1 = '#8b5cf6',
  color2 = '#1E88E5',
  flip = false,
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  const W = 1440
  const H = 80
  const steps = 120
  const amp = 18
  const freq = 2

  let d = `M 0 ${H / 2}`
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W
    const y = H / 2 + Math.sin((i / steps) * Math.PI * 2 * freq) * amp
    d += ` L ${x} ${y}`
  }

  const gradId = `div-grad-${Math.random().toString(36).slice(2, 6)}`

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: `${H}px`,
        overflow: 'hidden',
        transform: flip ? 'scaleX(-1)' : 'none',
        opacity: 0.6,
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        width="100%"
        height={H}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color1} stopOpacity={0} />
            <stop offset="30%" stopColor={color1} stopOpacity={0.6} />
            <stop offset="60%" stopColor={color2} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color2} stopOpacity={0} />
          </linearGradient>
        </defs>
        <motion.path
          d={d}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={2}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={1}
          strokeDasharray="4 8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 0.4 } : {}}
          transition={{ duration: 2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    </div>
  )
}
