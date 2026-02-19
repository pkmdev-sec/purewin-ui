import { useEffect, useRef, useState } from 'react'
import { useInView, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2,
  style = {},
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const motionVal = useMotionValue(0)

  const spring = useSpring(motionVal, {
    stiffness: 50,
    damping: 30,
    duration: duration * 1000,
  })

  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (isInView) {
      motionVal.set(value)
    }
  }, [isInView, value, motionVal])

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => {
      if (decimals > 0) {
        setDisplay(v.toFixed(decimals))
      } else {
        setDisplay(Math.round(v).toLocaleString())
      }
    })
    return unsubscribe
  }, [spring, decimals])

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        fontFamily: 'var(--font-mono)',
        display: 'inline-block',
        ...style,
      }}
    >
      {prefix}{display}{suffix}
    </motion.span>
  )
}
