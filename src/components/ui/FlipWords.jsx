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
      style={{ display: 'inline-block', position: 'relative', ...style }}
    >
      <span
        key={word}
        style={{
          display: 'inline-block',
          animation: wordAnimation,
        }}
      >
        {word}
      </span>
    </span>
  )
}
