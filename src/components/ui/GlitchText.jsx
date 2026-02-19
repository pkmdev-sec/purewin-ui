import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const glitchKeyframes = `
@keyframes glitch-clip-1 {
  0% { clip-path: inset(20% 0 60% 0); transform: translate(-3px, 2px); }
  20% { clip-path: inset(50% 0 20% 0); transform: translate(3px, -1px); }
  40% { clip-path: inset(10% 0 70% 0); transform: translate(-2px, 1px); }
  60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
  80% { clip-path: inset(30% 0 40% 0); transform: translate(-1px, 2px); }
  100% { clip-path: inset(60% 0 10% 0); transform: translate(1px, -1px); }
}
@keyframes glitch-clip-2 {
  0% { clip-path: inset(65% 0 5% 0); transform: translate(3px, -2px); }
  20% { clip-path: inset(15% 0 55% 0); transform: translate(-3px, 1px); }
  40% { clip-path: inset(45% 0 25% 0); transform: translate(2px, 2px); }
  60% { clip-path: inset(5% 0 75% 0); transform: translate(-2px, -1px); }
  80% { clip-path: inset(70% 0 10% 0); transform: translate(1px, 1px); }
  100% { clip-path: inset(35% 0 35% 0); transform: translate(-1px, -2px); }
}
`

export default function GlitchText({ text, style = {} }) {
  const [glitching, setGlitching] = useState(false)
  const styleRef = useRef(null)

  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement('style')
      el.textContent = glitchKeyframes
      document.head.appendChild(el)
      styleRef.current = el
    }

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
