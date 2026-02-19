import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Menu, X } from 'lucide-react'
import MagneticButton from './ui/MagneticButton'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Terminal', href: '#terminal' },
  { label: 'Stats', href: '#stats' },
  { label: 'Download', href: '#download' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollTo(href) {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 48px)',
        backgroundColor: scrolled ? 'rgba(5, 6, 10, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(139, 92, 246, 0.08)' : '1px solid transparent',
        transition: 'background-color 0.3s, backdrop-filter 0.3s, border-color 0.3s',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          style={{
            fontFamily: 'var(--font-pixel-square)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#ffffff',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}
          onMouseEnter={e => e.currentTarget.style.textShadow = '0 0 20px rgba(139,92,246,0.6), 0 0 40px rgba(139,92,246,0.3)'}
          onMouseLeave={e => e.currentTarget.style.textShadow = 'none'}
        >
          &lt;pw/&gt;
        </a>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          marginLeft: '12px',
        }}>
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: '#8b5cf6',
            display: 'inline-block',
            animation: 'pulse-dot 2s ease infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'rgba(139,92,246,0.6)',
            letterSpacing: '0.1em',
          }}>v1.0.0</span>
        </div>
      </div>

      {/* Desktop nav */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '28px',
            alignItems: 'center',
          }}
          className="nav-links-desktop"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                scrollTo(link.href)
              }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                letterSpacing: '0.03em',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        <MagneticButton
          href="https://github.com/lakshaymdev/purewin"
          variant="outlined"
          style={{
            padding: '8px 16px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <Github size={15} />
          <span className="nav-github-text">GitHub</span>
        </MagneticButton>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="nav-mobile-toggle"
          style={{
            display: 'none',
            color: 'var(--text-primary)',
            padding: '4px',
          }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '64px',
              left: 0,
              right: 0,
              backgroundColor: 'rgba(5, 6, 10, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  scrollTo(link.href)
                }}
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  padding: '8px 0',
                }}
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive styles injected */}
      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-github-text { display: none; }
          .nav-mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
