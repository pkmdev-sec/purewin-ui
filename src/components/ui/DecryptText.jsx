import { useEffect, useRef, useState } from 'react'

const CIPHER_CHARS = '░▒▓█▄▀─│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export default function DecryptText({
  text,
  delay = 0,
  speed = 40,
  iterations = 8,
  style = {},
}) {
  const [display, setDisplay] = useState('')
  const animRef = useRef(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const chars = text.split('')
    const resolved = new Array(chars.length).fill(false)
    const current = chars.map(() =>
      CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)]
    )
    let iterCount = 0
    let charIndex = 0

    const delayTimer = setTimeout(() => {
      function step() {
        iterCount++

        for (let i = 0; i < chars.length; i++) {
          if (!resolved[i]) {
            current[i] = CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)]
          }
        }

        if (iterCount % iterations === 0 && charIndex < chars.length) {
          resolved[charIndex] = true
          current[charIndex] = chars[charIndex]
          charIndex++
        }

        setDisplay(current.join(''))

        if (charIndex < chars.length) {
          animRef.current = setTimeout(step, speed)
        }
      }

      step()
    }, delay)

    return () => {
      clearTimeout(delayTimer)
      if (animRef.current) clearTimeout(animRef.current)
    }
  }, [text, delay, speed, iterations])

  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        display: 'inline-block',
        ...style,
      }}
    >
      {display || '\u00A0'}
    </span>
  )
}
