import { useRef, useEffect, useState } from 'react'
import { useSpring, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'

/**
 * TracingBeam — React port of inspira-ui's TracingBeam.vue
 * Animated SVG gradient beam on the left that follows scroll.
 */
export default function TracingBeam({ children, className = '' }) {
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const gradientRef = useRef(null)
  const dotRef = useRef(null)
  const [svgHeight, setSvgHeight] = useState(0)
  const gradientId = useRef(`tbg-${Math.random().toString(36).slice(2, 6)}`).current

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const y1Raw = useTransform(scrollYProgress, [0, 0.8], [0, svgHeight * 1.2])
  const y2Raw = useTransform(scrollYProgress, [0, 1], [50, Math.max(svgHeight, 100)])

  const y1 = useSpring(y1Raw, { stiffness: 80, damping: 26 })
  const y2 = useSpring(y2Raw, { stiffness: 80, damping: 26 })

  // Imperatively update SVG gradient y1/y2
  useMotionValueEvent(y1, 'change', (v) => {
    if (gradientRef.current) gradientRef.current.setAttribute('y1', String(Math.max(0, v)))
  })
  useMotionValueEvent(y2, 'change', (v) => {
    if (gradientRef.current) gradientRef.current.setAttribute('y2', String(Math.max(50, v)))
  })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (dotRef.current) {
      dotRef.current.style.backgroundColor = v > 0.02 ? '#ffffff' : '#8b5cf6'
    }
  })

  useEffect(() => {
    if (!contentRef.current) return
    const ro = new ResizeObserver(() => setSvgHeight(contentRef.current?.offsetHeight ?? 0))
    ro.observe(contentRef.current)
    setSvgHeight(contentRef.current.offsetHeight)
    return () => ro.disconnect()
  }, [])

  const path = `M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%' }}>
      {/* Left-side beam */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '-36px',
        pointerEvents: 'none',
        zIndex: 20,
      }}>
        {/* Top dot */}
        <div style={{
          marginLeft: '27px',
          display: 'flex',
          width: '16px', height: '16px',
          alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
          border: '1px solid rgba(139,92,246,0.25)',
        }}>
          <div
            ref={dotRef}
            style={{
              width: '8px', height: '8px',
              borderRadius: '50%',
              backgroundColor: '#8b5cf6',
              border: '1px solid rgba(139,92,246,0.5)',
              transition: 'background-color 0.3s ease',
            }}
          />
        </div>

        {/* SVG track + beam */}
        {svgHeight > 0 && (
          <svg
            viewBox={`0 0 20 ${svgHeight}`}
            width="20"
            height={svgHeight}
            style={{ display: 'block', marginLeft: '16px' }}
            aria-hidden="true"
          >
            {/* Track */}
            <path d={path} fill="none" stroke="rgba(144,145,160,0.12)" strokeWidth="1" />
            {/* Animated beam */}
            <path d={path} fill="none" stroke={`url(#${gradientId})`} strokeWidth="1.5" />

            <defs>
              <linearGradient
                ref={gradientRef}
                id={gradientId}
                gradientUnits="userSpaceOnUse"
                x1="0" x2="0"
                y1="0" y2="50"
              >
                <stop offset="0%"   stopColor="#18CCFC" stopOpacity="0" />
                <stop offset="0%"   stopColor="#18CCFC" />
                <stop offset="32.5%" stopColor="#6344F5" />
                <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      {/* Page content */}
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  )
}
