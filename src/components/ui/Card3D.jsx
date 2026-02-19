import { createContext, useContext, useRef, useState, useCallback } from 'react'

/**
 * Card3D — React port of inspira-ui's card-3d components
 * CardContainer: tracks mouse → 3D rotation
 * CardBody: the card with preserve-3d
 * CardItem: individual elements with z-depth
 */

const MouseContext = createContext({ isEntered: false })

export function CardContainer({ children, className = '', containerClassName = '', style = {} }) {
  const ref = useRef(null)
  const [isEntered, setIsEntered] = useState(false)

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const x = (e.clientX - left - width / 2) / 25
    const y = (e.clientY - top - height / 2) / 25
    ref.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`
  }, [])

  const handleMouseEnter = useCallback(() => setIsEntered(true), [])

  const handleMouseLeave = useCallback(() => {
    setIsEntered(false)
    if (ref.current) ref.current.style.transform = 'rotateY(0deg) rotateX(0deg)'
  }, [])

  return (
    <MouseContext.Provider value={{ isEntered }}>
      <div
        className={containerClassName}
        style={{ perspective: '1000px', ...style }}
      >
        <div
          ref={ref}
          className={className}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformStyle: 'preserve-3d',
            transition: 'transform 200ms ease-out',
            width: '100%', height: '100%',
          }}
        >
          {children}
        </div>
      </div>
    </MouseContext.Provider>
  )
}

export function CardBody({ children, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', ...style }}
    >
      {children}
    </div>
  )
}

export function CardItem({
  as: Tag = 'div',
  children,
  className = '',
  style = {},
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}) {
  const { isEntered } = useContext(MouseContext)

  const transform = isEntered
    ? `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
    : 'translateX(0) translateY(0) translateZ(0) rotateX(0) rotateY(0) rotateZ(0)'

  return (
    <Tag
      className={className}
      style={{
        transition: 'transform 500ms ease-in-out',
        transform,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
