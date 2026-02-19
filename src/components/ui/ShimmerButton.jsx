import { useEffect, useRef } from 'react'

/**
 * ShimmerButton — React port of inspira-ui's ShimmerButton.vue
 * Button with rotating conic gradient shimmer border effect.
 */
export default function ShimmerButton({
  children,
  shimmerColor = '#ffffff',
  shimmerSize = '0.05em',
  borderRadius = '10px',
  shimmerDuration = '3s',
  background = 'rgba(8, 4, 20, 0.9)',
  className = '',
  style = {},
  onClick,
  href,
  as: Tag,
}) {
  const cssId = useRef(`shim-${Math.random().toString(36).slice(2, 6)}`).current

  useEffect(() => {
    const css = `
      @keyframes ${cssId}-slide {
        to { transform: translate(calc(100cqw - 100%), 0); }
      }
      @keyframes ${cssId}-spin {
        0%   { transform: translateZ(0) rotate(0deg); }
        15%, 35% { transform: translateZ(0) rotate(90deg); }
        65%, 85% { transform: translateZ(0) rotate(270deg); }
        100% { transform: translateZ(0) rotate(360deg); }
      }
      .${cssId}-slide { animation: ${cssId}-slide ${shimmerDuration} ease-in-out infinite alternate; }
      .${cssId}-spin  { animation: ${cssId}-spin calc(${shimmerDuration} * 2) infinite linear; }
    `
    const el = document.createElement('style')
    el.textContent = css
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [cssId, shimmerDuration])

  const vars = {
    '--spread': '90deg',
    '--shimmer-color': shimmerColor,
    '--radius': borderRadius,
    '--speed': shimmerDuration,
    '--cut': shimmerSize,
    '--bg': background,
  }

  const baseStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '10px 24px',
    color: '#ffffff',
    fontFamily: 'var(--font-pixel-triangle, var(--font-mono))',
    fontSize: '0.8rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    background: 'var(--bg)',
    transition: 'transform 300ms ease',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    zIndex: 0,
    ...vars,
    ...style,
  }

  const content = (
    <>
      {/* Shimmer layer */}
      <div style={{
        containerType: 'size',
        position: 'absolute', inset: 0, zIndex: -3,
        overflow: 'visible',
        filter: 'blur(2px)',
      }}>
        <div
          className={`${cssId}-slide`}
          style={{
            position: 'absolute', inset: 0,
            aspectRatio: '1',
            height: '100cqh',
            borderRadius: 0,
          }}
        >
          <div
            className={`${cssId}-spin`}
            style={{
              position: 'absolute',
              inset: '-100%',
              width: 'auto',
              background: `conic-gradient(from calc(270deg - (var(--spread) * 0.5)), transparent 0, var(--shimmer-color) var(--spread), transparent var(--spread))`,
            }}
          />
        </div>
      </div>

      {/* Inner highlight */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '8px',
        boxShadow: 'inset 0 -8px 10px rgba(255,255,255,0.08)',
        transition: 'box-shadow 300ms ease',
      }} />

      {/* Cut-out center (the solid bg) */}
      <div style={{
        position: 'absolute',
        inset: 'var(--cut)',
        zIndex: -2,
        borderRadius: 'var(--radius)',
        background: 'var(--bg)',
      }} />

      {/* Content */}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
        {children}
      </span>
    </>
  )

  if (href) {
    return <a href={href} style={baseStyle} className={className} target="_blank" rel="noopener">{content}</a>
  }
  const El = Tag || 'button'
  return <El style={baseStyle} className={className} onClick={onClick}>{content}</El>
}
