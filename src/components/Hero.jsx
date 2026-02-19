import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Download, ExternalLink, ChevronDown } from 'lucide-react'
import ShimmerButton from './ui/ShimmerButton'
import FlipWords from './ui/FlipWords'
import GlareCard from './ui/GlareCard'
import NeonBorder from './ui/NeonBorder'
import HeroBackground from './ui/HeroBackground'
const CHAR_COLORS = ['#c47a7a', '#c4944e', '#c4b84e', '#6ab56a', '#4ab8b8', '#5a8ed4', '#9a72d4']

function MulticolorTitle() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        fontFamily: 'var(--font-pixel-square)',
        fontSize: 'clamp(2rem, 4vw, 3.8rem)',
        lineHeight: 1.0,
        letterSpacing: '-0.02em',
        fontWeight: 'normal',
        display: 'block',
        marginBottom: '10px',
      }}
    >
      {'PureWin'.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 + i * 0.05, ease: 'easeOut' }}
          whileHover={{ scale: 1.08, y: -2 }}
          style={{
            color: CHAR_COLORS[i],
            display: 'inline-block',
            textShadow: `0 0 18px ${CHAR_COLORS[i]}55`,
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  )
}

export default function Hero() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -40])
  const cardOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section
      id="hero"
      ref={heroRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '640px',
        overflow: 'hidden',
        backgroundColor: '#000000',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <HeroBackground />
      </div>

      {/* ── GlareCard — vertically centered left ──────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 'clamp(24px, 3vw, 48px)',
        transform: 'translateY(-50%)',
        zIndex: 10,
        width: 'clamp(340px, 38vw, 500px)',
      }}>
      <motion.div
        style={{ y: cardY, opacity: cardOpacity }}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <NeonBorder color1="#8b5cf6" color2="#1E88E5" animationType="half" duration={8} borderRadius="20px" style={{ width: '100%' }}>
        <GlareCard style={{ width: '100%', height: '100%' }}>
          <div style={{
            padding: 'clamp(20px, 2.5vw, 32px) clamp(20px, 3vw, 40px)',
            background: 'transparent',
            borderRadius: '20px',
          }}>
            {/* Label row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                fontFamily: 'var(--font-pixel-grid)',
                fontSize: '0.55rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(139,92,246,0.6)',
                marginBottom: '12px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <span style={{
                width: '4px', height: '4px', borderRadius: '50%',
                background: '#8b5cf6', display: 'inline-block',
                animation: 'pulse-dot 2s ease infinite',
              }} />
              Windows Optimization Toolkit
            </motion.div>

            {/* Title */}
            <MulticolorTitle />

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              style={{
                fontSize: 'clamp(0.9rem, 1.3vw, 1.1rem)',
                color: '#8892a4',
                lineHeight: 1.65,
                marginBottom: '28px',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
              }}
            >
              <span>Your Windows,</span>
              <FlipWords
                words={['purified.', 'optimized.', 'cleaned.', 'accelerated.', 'simplified.']}
                duration={2800}
                style={{ color: '#8b5cf6', fontWeight: 600 }}
              />
            </motion.p>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}
            >
              <ShimmerButton
                href="https://github.com/lakshaymdev/purewin/releases"
                shimmerColor="#8b5cf6"
                background="rgba(139,92,246,0.12)"
                borderRadius="10px"
                shimmerDuration="2.5s"
              >
                <Download size={14} />
                Download pw.exe
              </ShimmerButton>
              <ShimmerButton
                href="https://github.com/lakshaymdev/purewin"
                shimmerColor="#ffffff"
                background="rgba(8,4,20,0.6)"
                borderRadius="10px"
                shimmerDuration="3s"
              >
                <ExternalLink size={14} />
                GitHub
              </ShimmerButton>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.58rem',
                  color: 'rgba(255,255,255,0.18)',
                  letterSpacing: '0.06em',
                  marginLeft: '4px',
                }}
              >
                v1.0.0 · MIT · Win 10/11
              </motion.span>
            </motion.div>
          </div>
        </GlareCard>
        </NeonBorder>
      </motion.div>
      </div>{/* end outer centering wrapper */}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        style={{
          position: 'absolute', bottom: '24px', left: '50%',
          transform: 'translateX(-50%)', zIndex: 5, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        }}
      >
        <div style={{
          width: '1px', height: '28px',
          background: 'linear-gradient(to bottom, transparent, rgba(139,92,246,0.35))',
        }} />
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ChevronDown size={12} color="rgba(139,92,246,0.35)" />
        </motion.div>
      </motion.div>
    </section>
  )
}
