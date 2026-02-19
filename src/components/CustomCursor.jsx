import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const trailRefs = useRef([])
  const mouse = useRef({ x: -100, y: -100 })
  const pos = useRef({ x: -100, y: -100 })
  const trail = useRef(Array.from({ length: 5 }, () => ({ x: -100, y: -100 })))
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)
  const animRef = useRef(null)

  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    if (isMobile) return

    function handleMove(e) {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
      if (!visible) setVisible(true)
    }

    function handleOver(e) {
      const el = e.target
      if (
        el.tagName === 'A' ||
        el.tagName === 'BUTTON' ||
        el.closest('a') ||
        el.closest('button') ||
        el.style?.cursor === 'pointer'
      ) {
        setHovering(true)
      }
    }

    function handleOut() {
      setHovering(false)
    }

    function handleLeave() {
      setVisible(false)
    }

    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)
    document.addEventListener('mouseleave', handleLeave)

    function animate() {
      const lerp = 0.12
      pos.current.x += (mouse.current.x - pos.current.x) * lerp
      pos.current.y += (mouse.current.y - pos.current.y) * lerp

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`
      }

      for (let i = trail.current.length - 1; i > 0; i--) {
        trail.current[i].x = trail.current[i - 1].x
        trail.current[i].y = trail.current[i - 1].y
      }
      trail.current[0].x = pos.current.x
      trail.current[0].y = pos.current.y

      trailRefs.current.forEach((el, i) => {
        if (el) {
          el.style.transform = `translate(${trail.current[i].x}px, ${trail.current[i].y}px) translate(-50%, -50%)`
          el.style.opacity = (1 - (i + 1) / trail.current.length) * 0.4
        }
      })

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
      document.removeEventListener('mouseleave', handleLeave)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [visible])

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  if (isMobile) return null

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: hovering ? '40px' : '8px',
          height: hovering ? '40px' : '8px',
          borderRadius: '50%',
          backgroundColor: hovering ? 'transparent' : '#fff',
          border: hovering ? '2px solid #fff' : 'none',
          pointerEvents: 'none',
          zIndex: 99999,
          mixBlendMode: 'difference',
          transition: 'width 0.2s ease, height 0.2s ease, background-color 0.2s ease, border 0.2s ease',
          opacity: visible ? 1 : 0,
          willChange: 'transform',
        }}
      />
      {trail.current.map((_, i) => (
        <div
          key={i}
          ref={(el) => (trailRefs.current[i] = el)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            pointerEvents: 'none',
            zIndex: 99998,
            mixBlendMode: 'difference',
            opacity: 0,
            willChange: 'transform',
          }}
        />
      ))}
    </>
  )
}
