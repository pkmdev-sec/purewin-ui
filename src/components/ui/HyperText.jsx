import { useRef, useState, useCallback } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

export default function HyperText({
  text,
  duration = 800,
  as: Tag = 'span',
  style = {},
  className = '',
  animateOnLoad = false,
}) {
  const [displayText, setDisplayText] = useState(text.split(''))
  const iterRef = useRef(null)

  const scramble = useCallback(() => {
    let iteration = 0
    clearInterval(iterRef.current)
    iterRef.current = setInterval(() => {
      setDisplayText(prev =>
        prev.map((char, i) => {
          if (char === ' ') return ' '
          if (i < iteration) return text[i]
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
      )
      if (iteration >= text.length) clearInterval(iterRef.current)
      iteration += 1 / 3
    }, duration / (text.length * 3))
  }, [text, duration])

  return (
    <Tag
      style={{ cursor: 'default', ...style }}
      className={className}
      onMouseEnter={scramble}
    >
      {displayText.map((char, i) => (
        <span
          key={i}
          style={{ color: char !== text[i] ? 'rgba(139,92,246,0.7)' : 'inherit' }}
        >
          {char}
        </span>
      ))}
    </Tag>
  )
}
