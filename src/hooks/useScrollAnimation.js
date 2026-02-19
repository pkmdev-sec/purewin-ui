import { useRef } from 'react'
import { useInView, useScroll, useTransform } from 'framer-motion'

export function useRevealOnScroll(margin = '-80px') {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin })
  return { ref, isInView }
}

export function useParallax(ref, inputRange = [0, 1], outputRange = [0, -100]) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, inputRange, outputRange)
  return y
}
