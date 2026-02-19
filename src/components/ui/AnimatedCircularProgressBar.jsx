import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * AnimatedCircularProgressBar — React port of inspira-ui's component
 * SVG circular gauge that animates on scroll-into-view.
 */
export default function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor = '#8b5cf6',
  gaugeSecondaryColor = 'rgba(255,255,255,0.06)',
  circleStrokeWidth = 10,
  duration = 1.2,
  showPercentage = true,
  className = '',
  style = {},
  children,
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  const circumference = 2 * Math.PI * 45
  const percentPx = circumference / 100
  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  const secondaryDash = Math.max(0, (90 - percent) * percentPx)

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: 'relative', width: '140px', height: '140px', ...style }}
    >
      <svg fill="none" viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        {/* Secondary (remaining) arc */}
        {percent <= 90 && (
          <circle
            cx="50" cy="50" r="45"
            strokeWidth={circleStrokeWidth}
            fill="none"
            stroke={gaugeSecondaryColor}
            strokeDasharray={`${secondaryDash} ${circumference}`}
            style={{
              transform: `rotate(${270 - (5 * 3.6 * 0)}deg) scaleY(-1)`,
              transformOrigin: '50px 50px',
              transition: `all ${duration}s ease`,
            }}
          />
        )}
        {/* Primary (filled) arc */}
        <motion.circle
          cx="50" cy="50" r="45"
          strokeWidth={circleStrokeWidth}
          fill="none"
          stroke={gaugePrimaryColor}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={isInView
            ? { strokeDasharray: `${percent * percentPx} ${circumference}` }
            : { strokeDasharray: `0 ${circumference}` }
          }
          transition={{ duration, ease: 'easeOut', delay: 0.1 }}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50px 50px',
            filter: `drop-shadow(0 0 6px ${gaugePrimaryColor}88)`,
          }}
        />
      </svg>

      {/* Center content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '2px',
      }}>
        {children}
      </div>
    </div>
  )
}
