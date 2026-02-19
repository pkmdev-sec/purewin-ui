import { motion, useInView } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { Trash2, Package, BarChart3, Activity, Code2, Shield } from 'lucide-react'
import AetherField from './ui/AetherField'
import SilkBackground from './ui/SilkBackground'
import GlareCard from './ui/GlareCard'
import NeonBorder from './ui/NeonBorder'
import BlurReveal from './ui/BlurReveal'

const FEATURES = [
  {
    icon: Trash2,
    title: 'Deep System Cleanup',
    description: 'Obliterates temp files, caches, logs, and browser data in seconds.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #00ffd5)',
    beamColor: '#8b5cf6',
    number: '01',
  },
  {
    icon: Package,
    title: 'Complete App Removal',
    description: 'Surgically removes apps with all registry entries and hidden remnants.',
    gradient: 'linear-gradient(135deg, #1E88E5, #42A5F5)',
    beamColor: '#1E88E5',
    number: '02',
  },
  {
    icon: BarChart3,
    title: 'Disk Space Analysis',
    description: 'Interactive treemap showing exactly where your storage went.',
    gradient: 'linear-gradient(135deg, #b18cff, #8b5cf6)',
    beamColor: '#b18cff',
    number: '03',
  },
  {
    icon: Activity,
    title: 'Real-Time Monitoring',
    description: 'Live dashboard for CPU, memory, disk, network, and GPU metrics.',
    gradient: 'linear-gradient(135deg, #f08b47, #f3a76b)',
    beamColor: '#f08b47',
    number: '04',
  },
  {
    icon: Code2,
    title: 'Dev Tool Cleanup',
    description: 'Purges node_modules, target/, .gradle, .nuget and other build artifacts.',
    gradient: 'linear-gradient(135deg, #00ffd5, #42A5F5)',
    beamColor: '#00ffd5',
    number: '05',
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Whitelist protection, dry-run mode, and NEVER_DELETE safeguards.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #1E88E5)',
    beamColor: '#a78bfa',
    number: '06',
  },
]

function FeatureCard({ feature, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = feature.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      style={{ height: '100%' }}
    >
    <NeonBorder color1="#8b5cf6" color2="#1E88E5" animationType="half" duration={6} borderRadius="20px">
    <GlareCard style={{ height: '100%', minHeight: '220px' }}>
      <div style={{ padding: '28px', position: 'relative', height: '100%' }}>
      {/* Gradient orb behind icon */}
      <div style={{
        position: 'absolute', top: '-20px', left: '-20px',
        width: '120px', height: '120px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${feature.beamColor}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Number */}
      <div style={{
        position: 'absolute', top: '20px', right: '20px',
        fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.15em',
        color: 'rgba(139,92,246,0.3)',
        fontFamily: 'var(--font-mono)',
      }}>{feature.number}</div>

      {/* Icon */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: `linear-gradient(135deg, ${feature.beamColor}20, ${feature.beamColor}08)`,
        border: `1px solid ${feature.beamColor}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <Icon size={22} color={feature.beamColor} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '1.05rem', fontWeight: 700, color: '#f0f0ff',
        marginBottom: '10px', letterSpacing: '-0.01em', lineHeight: 1.3,
        fontFamily: 'var(--font-mono)',
      }}>
        {feature.title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: '0.875rem', lineHeight: 1.65, color: '#7a829a',
        fontFamily: 'var(--font-mono)', margin: 0,
      }}>
        {feature.description}
      </p>
      </div>
    </GlareCard>
    </NeonBorder>
    </motion.div>
  )
}

export default function Features() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .shimmer-overlay:hover .shimmer-beam {
        animation: shimmer 0.8s ease forwards;
      }
      @keyframes shimmer {
        from { left: -60px; }
        to { left: calc(100% + 60px); }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  return (
    <section
      id="features"
      ref={sectionRef}
      style={{
        position: 'relative',
        padding: 'clamp(80px, 10vw, 140px) clamp(16px, 5vw, 80px)',
        backgroundColor: 'var(--bg-void)',
        overflow: 'hidden',
      }}
    >
      {/* Silk WebGL — subtle purple texture over pitch black */}
      {/* Black & white silk texture — saturation=0 gives pure grayscale */}
      <SilkBackground
        hue={0}
        saturation={0}
        brightness={1.0}
        speed={0.4}
        style={{ opacity: 0.22, pointerEvents: 'auto', zIndex: 0 }}
      />

      {/* Very light vignette — top+bottom edge only, keeps center clear */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.55) 100%)',
      }} />

      {/* Section radial glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(30,136,229,0.04) 0%, transparent 70%)',
      }} />

      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(48px, 6vw, 80px)', position: 'relative', zIndex: 2 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--xp-green)', display: 'block', marginBottom: '16px',
        }}>{'// FEATURES'}</span>
        <BlurReveal delay={0.15}>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #f5f7ff 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
          }}>Everything you need.</h2>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '1rem',
            color: '#8892a4', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6,
          }}>One binary. Six powerful tools. Zero bloat.</p>
        </BlurReveal>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        maxWidth: '1160px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
      }}>
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </section>
  )
}
