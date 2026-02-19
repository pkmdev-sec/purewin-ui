import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Download as DownloadIcon, Copy, Check } from 'lucide-react'
import MagneticButton from './ui/MagneticButton'
import HoloSun from './ui/HoloSun'
import AsciiSpheres from './ui/AsciiSpheres'
import MarqueeScroll from './ui/MarqueeScroll'
import Meteors from './ui/Meteors'
import BlurReveal from './ui/BlurReveal'
import SparklesText from './ui/SparklesText'

function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: 'rgba(5, 6, 10, 0.8)',
        border: '1px solid rgba(139, 92, 246, 0.15)',
        borderRadius: '8px',
        padding: '16px 48px 16px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        color: 'var(--xp-green-light)',
        overflow: 'auto',
        width: '100%',
      }}
    >
      {label && (
        <div
          style={{
            fontFamily: 'var(--font-pixel-line)',
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          {label}
        </div>
      )}
      <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{code}</code>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '6px',
          borderRadius: '4px',
          border: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(15, 20, 32, 0.8)',
          cursor: 'pointer',
          color: copied ? 'var(--xp-green)' : 'var(--text-muted)',
          transition: 'color 0.2s, border-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  )
}

export default function Download() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section
      id="download"
      ref={sectionRef}
      style={{
        position: 'relative',
        padding: 'clamp(80px, 10vw, 140px) clamp(16px, 5vw, 80px)',
        backgroundColor: 'var(--bg-deep)',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Meteors count={15} color="#8b5cf6" />

      {/* HoloSun decorative element */}
      <div style={{
        position: 'absolute', right: '-80px', top: '50%', transform: 'translateY(-50%)',
        opacity: 0.45, pointerEvents: 'none', zIndex: 0,
      }}>
        <HoloSun width={500} height={500} />
      </div>
      <AsciiSpheres style={{ opacity: 0.6 }} />

      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Heading */}
        <BlurReveal delay={0.15}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--xp-green)',
              display: 'block',
              marginBottom: '20px',
            }}
          >
            {'// GET STARTED'}
          </span>

          <h2 style={{
            fontFamily: 'var(--font-pixel-square)',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '20px',
          }}>
            One Binary.{' '}
            <SparklesText text="Pure Power." sparkleColor="#8b5cf6" style={{ color: '#8b5cf6' }} />
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem',
              color: '#8892a4',
              marginBottom: '40px',
              lineHeight: 1.65,
            }}
          >
            Install with Go or download the binary directly.
          </p>
        </BlurReveal>

        {/* Install commands */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '36px',
          }}
        >
          <CodeBlock
            label="Go Install"
            code="go install github.com/lakshaymdev/purewin@latest"
          />
          <CodeBlock
            label="PowerShell"
            code='irm https://raw.githubusercontent.com/lakshaymdev/purewin/main/install.ps1 | iex'
          />
        </motion.div>

        {/* Marquee */}
        <MarqueeScroll
          items={['→ pw clean', '→ pw analyze', '→ pw status', '→ pw uninstall', '→ pw optimize', '→ pw purge', '→ pw update', '→ pw installer', '→ pw version', '→ pw remove']}
          speed={25}
          style={{ margin: '32px 0' }}
        />

        {/* Download button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{ position: 'relative', display: 'inline-block' }}
        >
          <MagneticButton
            href="https://github.com/lakshaymdev/purewin/releases"
            variant="solid"
            style={{
              padding: '18px 40px',
              fontSize: '1rem',
              fontWeight: 700,
              animation: 'pulse-green 2s ease-in-out infinite',
            }}
          >
            <DownloadIcon size={18} />
            Download pw.exe
          </MagneticButton>
          {/* Glow rings */}
          {[1, 2, 3].map(ring => (
            <div key={ring} style={{
              position: 'absolute',
              inset: `-${ring * 8}px`,
              borderRadius: 'inherit',
              border: `1px solid rgba(139,92,246,${0.4 / ring})`,
              animation: `glow-ring ${1.5 + ring * 0.5}s ease-out infinite`,
              animationDelay: `${ring * 0.3}s`,
              pointerEvents: 'none',
            }} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
