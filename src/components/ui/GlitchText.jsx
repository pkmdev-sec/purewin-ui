import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'


export default function GlitchText({ text, style = {} }) {
  const [glitching, setGlitching] = useState(false)

  useEffect(() => {
    function triggerGlitch() {
      setGlitching(true)
      setTimeout(() => setGlitching(false), 200 + Math.random() * 150)

      const next = 3000 + Math.random() * 5000
      setTimeout(triggerGlitch, next)
    }

    const initial = setTimeout(triggerGlitch, 1000 + Math.random() * 2000)
    return () => clearTimeout(initial)
  }, [])

  const baseStyle = {
    position: 'relative',
    display: 'inline-block',
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    color: 'var(--text-primary)',
    ...style,
  }

  const pseudoBase = {
    content: '""',
    position: 'absolute',
    inset: 0,
    opacity: glitching ? 0.8 : 0,
    pointerEvents: 'none',
  }

  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={baseStyle}
      data-text={text}
    >
      {text}
      <span
        aria-hidden="true"
        style={{
          ...pseudoBase,
          color: '#ff0040',
          animation: glitching ? 'glitch-clip-1 0.15s steps(2) infinite' : 'none',
          left: glitching ? '-2px' : 0,
          textShadow: glitching ? '2px 0 #ff0040' : 'none',
        }}
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        style={{
          ...pseudoBase,
          color: '#0040ff',
          animation: glitching ? 'glitch-clip-2 0.15s steps(2) infinite' : 'none',
          left: glitching ? '2px' : 0,
          textShadow: glitching ? '-2px 0 #0040ff' : 'none',
        }}
      >
        {text}
      </span>
    </motion.span>
  )
}
