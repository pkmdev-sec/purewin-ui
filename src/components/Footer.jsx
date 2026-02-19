import { Github, ExternalLink, Bug } from 'lucide-react'
import GlitchText from './ui/GlitchText'

export default function Footer() {
  const linkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    transition: 'color 0.2s',
  }

  return (
    <footer
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-void)',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
      }}
    >
      {/* Animated gradient top line */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #8b5cf6, #1E88E5, #00ffd5, transparent)',
        backgroundSize: '200% 100%',
        animation: 'gradient-shift 4s ease infinite',
        marginBottom: '0',
      }} />

      <div
        style={{
          padding: '48px clamp(16px, 5vw, 80px)',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            style={{
              textDecoration: 'none',
            }}
          >
            <GlitchText text="<pw/>" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }} />
          </a>

          {/* Links */}
          <div
            style={{
              display: 'flex',
              gap: '28px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <a
              href="https://github.com/lakshaymdev/purewin"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Github size={14} />
              GitHub
            </a>
            <a
              href="https://github.com/lakshaymdev/purewin/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <ExternalLink size={14} />
              MIT License
            </a>
            <a
              href="https://github.com/lakshaymdev/purewin/issues"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Bug size={14} />
              Report Issue
            </a>
          </div>

          {/* Built with */}
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#8892a4' }}>
            Built with{' '}
            <span style={{ color: '#00ACD7' }}>Go</span>
            {' · '}
            <span style={{ color: '#8b5cf6' }}>Open Source</span>
            {' · '}
            <span style={{ color: '#00A4EF' }}>Windows</span>
          </p>

          {/* Copyright */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              opacity: 0.4,
            }}
          >
            &copy; 2025 PureWin. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
