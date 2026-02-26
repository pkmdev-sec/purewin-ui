import { useState, useEffect } from 'react'

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

  useEffect(() => {
    if (words.length === 0) return

    const timerId = setTimeout(() => {
      setPhase('leaving')
      setTimeout(() => {
        setCurrentIdx(i => (i + 1) % words.length)
        setPhase('entering')
        setTimeout(() => setPhase('visible'), 400)
      }, 500)
    }, duration)

    return () => clearTimeout(timerId)
  }, [currentIdx, words, duration])

  const word = words[currentIdx] || ''
  const wordAnimation = phase === 'leaving'
    ? 'flip-leave 0.5s ease forwards'
    : 'flip-enter 0.4s ease forwards'

  return (
    <span
      className={className || undefined}
      style={{ display: 'inline-block', position: 'relative', animation: wordAnimation, ...style }}
    >
      {word.split('').map((char, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            display: 'inline-block',
            opacity: 0,
            animation: 'flip-enter 0.2s ease forwards',
            animationDelay: `${i * 0.04}s`,
          }}
        >
          {char === ' ' ? '\u00a0' : char}
        </span>
      ))}
    </span>
  )
}
