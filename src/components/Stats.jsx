import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import AnimatedCounter from './ui/AnimatedCounter'
import FlickeringGrid from './ui/FlickeringGrid'
import AnimatedCircularProgressBar from './ui/AnimatedCircularProgressBar'
import BlurReveal from './ui/BlurReveal'
import PixelCard from './ui/PixelCard'

const STATS = [
  {
    value: 2.8,
    decimals: 1,
    suffix: ' GB',
    label: 'Avg. space reclaimed per clean',
    gradient: 'linear-gradient(135deg, #8b5cf6, #00ffd5)',
    color: '#8b5cf6',
    progress: 70,
    pixelVariant: 'purple',
  },
  {
    value: 500,
    suffix: '+',
    label: 'Orphaned registry entries removed',
    gradient: 'linear-gradient(135deg, #1E88E5, #42A5F5)',
    color: '#1E88E5',
    progress: 85,
    pixelVariant: 'blue',
  },
  {
    value: 100,
    suffix: '%',
    label: 'Safety guarantee with dry-run',
    gradient: 'linear-gradient(135deg, #8b5cf6, #8BC34A)',
    color: '#8BC34A',
    progress: 100,
    pixelVariant: 'yellow',
  },
  {
    value: 0,
    suffix: 'ms',
    label: 'Memory overhead while idle',
    gradient: 'linear-gradient(135deg, #00ffd5, #1E88E5)',
    color: '#00ffd5',
    progress: 99,
    pixelVariant: 'cyan',
  },
]

function StatCard({ stat, index, isInView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <PixelCard variant={stat.pixelVariant}>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '32px 24px',
          zIndex: 1,
        }}>
          {/* Circular progress gauge */}
          <AnimatedCircularProgressBar
            value={stat.progress}
            max={100}
            gaugePrimaryColor={stat.color}
            gaugeSecondaryColor="rgba(255,255,255,0.06)"
            circleStrokeWidth={8}
            duration={1.5}
          >
            {/* Large value in center of ring */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
              fontWeight: 700,
              background: stat.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
              textAlign: 'center',
            }}>
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                decimals={stat.decimals || 0}
                duration={1.5}
              />
            </div>
          </AnimatedCircularProgressBar>

          {/* Label */}
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: '#7a829a',
            lineHeight: 1.5,
            textAlign: 'center',
            maxWidth: '160px',
          }}>
            {stat.label}
          </p>
        </div>
      </PixelCard>
    </motion.div>
  )
}

export default function Stats() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section
      id="stats"
      ref={sectionRef}
      style={{
        position: 'relative',
        padding: 'clamp(80px, 10vw, 140px) clamp(16px, 5vw, 80px)',
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* FlickeringGrid background — exact inspira-ui component */}
      <FlickeringGrid
        color="#8b5cf6"
        squareSize={3}
        gridGap={8}
        flickerChance={0.25}
        maxOpacity={0.18}
      />

      {/* Dark center overlay for readability */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
        zIndex: 0,
      }} />

      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(48px, 6vw, 80px)', position: 'relative', zIndex: 1 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#8b5cf6', display: 'block', marginBottom: '16px',
        }}>{'// BY THE NUMBERS'}</span>
        <BlurReveal delay={0.15}>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #f5f7ff 0%, #1E88E5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}>Performance that speaks.</h2>
        </BlurReveal>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        maxWidth: '960px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}>
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} isInView={isInView} />
        ))}
      </div>
    </section>
  )
}
