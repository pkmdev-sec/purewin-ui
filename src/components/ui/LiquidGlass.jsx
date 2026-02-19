import { useRef, useState, useEffect } from 'react'

/**
 * LiquidGlass — React port of inspira-ui's LiquidGlass.vue
 * Uses SVG displacement filters for a chromatic aberration glass effect.
 * Best on Chromium; limited Firefox support; not supported in Safari.
 */
export default function LiquidGlass({
  children,
  radius = 20,
  border = 0.07,
  lightness = 50,
  blend = 'difference',
  xChannel = 'R',
  yChannel = 'B',
  alpha = 0.88,
  blur = 11,
  rOffset = 0,
  gOffset = 10,
  bOffset = 20,
  scale = -180,
  frost = 0.04,
  className = '',
  style = {},
}) {
  const rootRef = useRef(null)
  const filterId = useRef(`lg-${Math.random().toString(36).slice(2, 8)}`)
  const [dims, setDims] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      let w = 0, h = 0
      if (entry.borderBoxSize?.length) {
        w = entry.borderBoxSize[0].inlineSize
        h = entry.borderBoxSize[0].blockSize
      } else if (entry.contentRect) {
        w = entry.contentRect.width
        h = entry.contentRect.height
      }
      setDims({ width: w, height: h })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { width, height } = dims
  const b = Math.min(width, height) * (border * 0.5)

  const svgContent = `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="red${filterId.current}" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="red"/>
        </linearGradient>
        <linearGradient id="blue${filterId.current}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="blue"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="black"/>
      <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#red${filterId.current})"/>
      <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#blue${filterId.current})" style="mix-blend-mode: ${blend}"/>
      <rect x="${b}" y="${b}" width="${width - b * 2}" height="${height - b * 2}" rx="${radius}"
        fill="hsl(0 0% ${lightness}% / ${alpha})" style="filter:blur(${blur}px)"/>
    </svg>`

  const dataUri = `data:image/svg+xml,${encodeURIComponent(svgContent)}`
  const fid = filterId.current

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: 'relative',
        display: 'block',
        borderRadius: `${radius}px`,
        backdropFilter: width > 0 ? `url(#${fid})` : undefined,
        WebkitBackdropFilter: width > 0 ? `url(#${fid})` : undefined,
        background: `rgba(0,0,0,${frost})`,
        boxShadow: [
          '0 0 2px 1px rgba(255,255,255,0.06) inset',
          '0 0 10px 4px rgba(255,255,255,0.03) inset',
          '0 4px 24px rgba(0,0,0,0.3)',
          '0 8px 48px rgba(0,0,0,0.2)',
        ].join(', '),
        ...style,
      }}
    >
      {/* Slot content */}
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: `${radius}px` }}>
        {children}
      </div>

      {/* SVG filter definition */}
      {width > 0 && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <defs>
            <filter id={fid} colorInterpolationFilters="sRGB">
              <feImage x="0" y="0" width="100%" height="100%" href={dataUri} result="map" />
              <feDisplacementMap in="SourceGraphic" in2="map"
                xChannelSelector={xChannel} yChannelSelector={yChannel}
                scale={scale + rOffset} result="dispRed" />
              <feColorMatrix in="dispRed" type="matrix"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
              <feDisplacementMap in="SourceGraphic" in2="map"
                xChannelSelector={xChannel} yChannelSelector={yChannel}
                scale={scale + gOffset} result="dispGreen" />
              <feColorMatrix in="dispGreen" type="matrix"
                values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
              <feDisplacementMap in="SourceGraphic" in2="map"
                xChannelSelector={xChannel} yChannelSelector={yChannel}
                scale={scale + bOffset} result="dispBlue" />
              <feColorMatrix in="dispBlue" type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
              <feBlend in="red" in2="green" mode="screen" result="rg" />
              <feBlend in="rg" in2="blue" mode="screen" result="output" />
            </filter>
          </defs>
        </svg>
      )}
    </div>
  )
}
