import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { TerminalSquare } from 'lucide-react'
import SentinelTerminal from './ui/SentinelTerminal'
import FaultyTerminalBg from './ui/FaultyTerminal'
import { CardContainer, CardBody, CardItem } from './ui/Card3D'
import HyperText from './ui/HyperText'

export default function Terminal() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section
      id="terminal"
      ref={sectionRef}
      style={{
        position: 'relative',
        padding: 'clamp(80px, 10vw, 140px) clamp(16px, 5vw, 80px)',
        backgroundColor: 'var(--bg-deep)',
        overflow: 'hidden',
      }}
    >
      {/* FaultyTerminal WebGL background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.45, pointerEvents: 'auto' }}>
        <FaultyTerminalBg
          scale={1.7}
          gridMul={[2, 1]}
          digitSize={1.8}
          timeScale={0.5}
          pause={false}
          scanlineIntensity={1.1}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0.19}
          tint="#cc0bda"
          mouseReact
          mouseStrength={0.5}
          pageLoadAnimation
          brightness={0.7}
        />
      </div>
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 'clamp(32px, 5vw, 64px)',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left: Text content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div
            style={{
              position: 'relative',
              padding: '32px',
              borderRadius: '16px',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(139,92,246,0.12)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--xp-green)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              <TerminalSquare size={16} />
              {'// HOW IT WORKS'}
            </span>

            <HyperText
              text="Command-line power, simplified."
              as="h2"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                marginBottom: '20px',
                lineHeight: 1.15,
                display: 'block',
              }}
            />

            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                lineHeight: 1.7,
                color: 'var(--text-muted)',
                marginBottom: '24px',
                maxWidth: '440px',
              }}
            >
              No GUI bloat. No background services. Just run{' '}
              <span style={{ color: 'var(--xp-green)' }}>pw</span> and let it handle
              the rest. Every command supports{' '}
              <span style={{ color: 'var(--xp-green)' }}>--dry-run</span> so you can
              preview before executing.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {[
                { cmd: 'pw clean', desc: 'Remove temp files, caches, logs' },
                { cmd: 'pw analyze', desc: 'Interactive disk usage treemap' },
                { cmd: 'pw status', desc: 'System health at a glance' },
              ].map((item) => (
                <CardContainer key={item.cmd} style={{ width: '100%', marginBottom: '0' }}>
                  <CardBody>
                    <CardItem translateZ={20}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.82rem',
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--xp-green)',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.cmd}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>{item.desc}</span>
                      </div>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Terminal */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        >
          <SentinelTerminal autoPlay={isInView} />
        </motion.div>
      </div>
    </section>
  )
}
