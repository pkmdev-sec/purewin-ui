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
  const [phase, setPhase] = useState('visible')
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const innermostRef = useRef(null)
  const wordsKey = words.join(',')

  useEffect(() => {
    if (words.length === 0) return

    outerRef.current = setTimeout(() => {
      setPhase('leaving')
      innerRef.current = setTimeout(() => {
        setCurrentIdx(i => (i + 1) % words.length)
        setPhase('entering')
        innermostRef.current = setTimeout(() => setPhase('visible'), 400)
      }, 500)
    }, duration)

    return () => {
      clearTimeout(outerRef.current)
      clearTimeout(innerRef.current)
      clearTimeout(innermostRef.current)
    }
  }, [currentIdx, wordsKey, duration])

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
