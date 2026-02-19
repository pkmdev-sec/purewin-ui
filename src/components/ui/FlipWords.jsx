import { useState, useEffect, useRef } from 'react'

/**
 * FlipWords — React port of inspira-ui's FlipWords.vue
 * Cycles through an array of words with blur-fade animation.
 */
export default function FlipWords({
  words = [],
  duration = 3000,
  style = {},
  className = '',
}) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [phase, setPhase] = useState('visible')  // 'visible' | 'leaving' | 'entering'
  const timerRef = useRef(null)
  const cssId = useRef(`fw-${Math.random().toString(36).slice(2, 6)}`).current

  useEffect(() => {
    const css = `
      @keyframes ${cssId}-enter {
        from { opacity: 0; transform: translateY(10px); filter: blur(8px); }
        to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
      }
      @keyframes ${cssId}-leave {
        from { opacity: 1; transform: scale(1);  filter: blur(0);   }
        to   { opacity: 0; transform: scale(2);  filter: blur(8px); }
      }
      .${cssId}-enter-word {
        animation: ${cssId}-enter 0.4s ease forwards;
      }
      .${cssId}-leave-word {
        animation: ${cssId}-leave 0.5s ease forwards;
      }
    `
    const el = document.createElement('style')
    el.textContent = css
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [cssId])

  useEffect(() => {
    if (words.length === 0) return

    timerRef.current = setTimeout(() => {
      setPhase('leaving')
      setTimeout(() => {
        setCurrentIdx(i => (i + 1) % words.length)
        setPhase('entering')
        setTimeout(() => setPhase('visible'), 400)
      }, 500)
    }, duration)

    return () => clearTimeout(timerRef.current)
  }, [currentIdx, words, duration])

  const word = words[currentIdx] || ''
  const animClass = phase === 'leaving' ? `${cssId}-leave-word`
    : phase === 'entering' ? `${cssId}-enter-word`
    : `${cssId}-enter-word`

  return (
    <span
      className={`${animClass} ${className}`}
      style={{ display: 'inline-block', position: 'relative', ...style }}
    >
      {word.split('').map((char, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            display: 'inline-block',
            opacity: 0,
            animation: `${cssId}-enter 0.2s ease forwards`,
            animationDelay: `${i * 0.04}s`,
          }}
        >
          {char === ' ' ? '\u00a0' : char}
        </span>
      ))}
    </span>
  )
}
