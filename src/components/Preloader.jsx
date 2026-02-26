import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Big ASCII PW logo (each line is a string of the pixel-art)
const PW_LOGO = [
  '██████╗ ██╗    ██╗',
  '██╔══██╗██║    ██║',
  '██████╔╝██║ █╗ ██║',
  '██╔═══╝ ██║███╗██║',
  '██║     ╚███╔███╔╝',
  '╚═╝      ╚══╝╚══╝ ',
]

const MATRIX_CHARS = '0123456789ABCDEF░▒▓│┤╡╢╖╕╣║╗╝┐└┴┬├─┼'
const GREEN = '#8b5cf6'
const DIM_GREEN = 'rgba(139,92,246,0.15)'

export default function Preloader({ finished }) {
  const canvasRef = useRef(null)
  const phaseRef = useRef('rain') // 'rain' | 'coalesce' | 'hold' | 'done'
  const [logoOpacity, setLogoOpacity] = useState(0)
  const [progressVal, setProgressVal] = useState(0)
  const [statusIdx, setStatusIdx] = useState(0)
  const rafRef = useRef(null)

  const STATUS_STEPS = [
    'SCANNING SYSTEM...',
    'LOADING MODULES...',
    'INITIALIZING ENGINE...',
    'READY.',
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const fontSize = 14
    const cols = Math.floor(canvas.width / fontSize)
    const drops = Array(cols).fill(0).map(() => Math.random() * -50)
    const speeds = Array(cols).fill(0).map(() => 0.3 + Math.random() * 0.7)

    let startTime = performance.now()
    let phase = 'rain'

    function render() {
      const now = performance.now()
      const elapsed = (now - startTime) / 1000

      // Trail effect
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (phase === 'rain' && elapsed < 1.8) {
        // Matrix rain
        for (let i = 0; i < drops.length; i++) {
          const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
          const brightness = Math.random()
          ctx.fillStyle = brightness > 0.95 ? '#ffffff' : brightness > 0.7 ? GREEN : DIM_GREEN
          ctx.font = `${fontSize}px "Geist Pixel Circle", monospace`
          ctx.fillText(char, i * fontSize, drops[i] * fontSize)

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0
          drops[i] += speeds[i]
        }
      } else if (elapsed >= 1.8 && elapsed < 2.2) {
        phase = 'coalesce'
        // Slow fade of rain
        for (let i = 0; i < drops.length; i++) {
          const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
          ctx.fillStyle = DIM_GREEN
          ctx.font = `${fontSize}px "Geist Pixel Circle", monospace`
          ctx.fillText(char, i * fontSize, drops[i] * fontSize)
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) drops[i] = 0
          drops[i] += speeds[i] * 0.3
        }
      } else if (elapsed >= 2.2) {
        phase = 'hold'
        // Clear most of screen, leave faint bg
        ctx.fillStyle = 'rgba(0,0,0,0.2)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      rafRef.current = requestAnimationFrame(render)
    }

    render()

    // Show logo at 2.2s
    setTimeout(() => setLogoOpacity(1), 2200)

    // Progress bar
    let p = 0
    const pTimer = setInterval(() => {
      p += 1.5 + Math.random() * 2
      setProgressVal(Math.min(p, 100))
      if (p >= 100) clearInterval(pTimer)
    }, 35)

    // Status steps
    setStatusIdx(0)
    setTimeout(() => setStatusIdx(1), 700)
    setTimeout(() => setStatusIdx(2), 1400)
    setTimeout(() => setStatusIdx(3), 2100)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearInterval(pTimer)
    }
  }, [])

  return (
    <AnimatePresence>
      {!finished && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            backgroundColor: '#000000',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Matrix canvas background */}
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />

          {/* PW ASCII logo */}
          <motion.div
            animate={{ opacity: logoOpacity, y: logoOpacity === 1 ? 0 : 20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative', zIndex: 1,
              textAlign: 'center', marginBottom: '48px',
            }}
          >
            {PW_LOGO.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: logoOpacity, x: 0 }}
                transition={{ duration: 0.5, delay: 2.2 + i * 0.06, ease: 'easeOut' }}
                style={{
                  fontFamily: '"Geist Pixel Square", monospace',
                  fontSize: 'clamp(1.4rem, 3.5vw, 2.8rem)',
                  lineHeight: 1.1,
                  color: GREEN,
                  whiteSpace: 'pre',
                  textShadow: `0 0 20px rgba(139,92,246,0.6), 0 0 60px rgba(139,92,246,0.2)`,
                  letterSpacing: '0.05em',
                }}
              >
                {line}
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: logoOpacity * 0.6 }}
              transition={{ duration: 0.5, delay: 2.6 }}
              style={{
                fontFamily: '"Geist Pixel Grid", monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.4em',
                color: 'rgba(139,92,246,0.6)',
                textTransform: 'uppercase',
                marginTop: '12px',
              }}
            >
              WINDOWS OPTIMIZATION TOOLKIT · v1.0.0
            </motion.div>
          </motion.div>

          {/* Status + progress */}
          <motion.div
            animate={{ opacity: logoOpacity }}
            style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
          >
            <div style={{
              fontFamily: '"Geist Pixel Grid", monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              color: 'rgba(139,92,246,0.7)',
              marginBottom: '16px',
              minHeight: '1.4em',
            }}>
              {STATUS_STEPS[statusIdx]}
              <span style={{
                display: 'inline-block',
                width: '8px', height: '14px',
                backgroundColor: GREEN,
                marginLeft: '4px',
                verticalAlign: 'middle',
                animation: 'pulse-dot 0.8s step-end infinite',
              }} />
            </div>

            <div style={{
              width: 'min(360px, 60vw)', height: '2px',
              backgroundColor: 'rgba(139,92,246,0.1)',
              borderRadius: '1px', overflow: 'hidden', position: 'relative',
            }}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progressVal / 100 }}
                transition={{ duration: 0.15 }}
                style={{
                  height: '100%',
                  width: '100%',
                  transformOrigin: 'left',
                  background: 'linear-gradient(to right, #6d28d9, #8b5cf6, #00ffd5)',
                  borderRadius: '1px',
                  boxShadow: '0 0 12px rgba(139,92,246,0.8)',
                }}
              />
            </div>

            <div style={{
              fontFamily: '"Geist Pixel Line", monospace',
              fontSize: '0.55rem',
              letterSpacing: '0.15em',
              color: 'rgba(139,92,246,0.35)',
              marginTop: '10px',
            }}>
              {Math.floor(progressVal)}% COMPLETE
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
