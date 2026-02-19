import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * BlurReveal — React port of inspira-ui's BlurReveal.vue
 * Each child animates in with blur + fade when scrolled into view.
 */
export default function BlurReveal({
  children,
  duration = 0.8,
  delay = 0.1,
  blur = '16px',
  yOffset = 20,
  className = '',
  style = {},
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  const childArray = Array.isArray(children) ? children : [children]

  return (
    <div ref={ref} className={className} style={style}>
      {childArray.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, filter: `blur(${blur})`, y: yOffset }}
          animate={isInView
            ? { opacity: 1, filter: 'blur(0px)', y: 0 }
            : { opacity: 0, filter: `blur(${blur})`, y: yOffset }
          }
          transition={{
            duration,
            ease: 'easeInOut',
            delay: delay * i,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
