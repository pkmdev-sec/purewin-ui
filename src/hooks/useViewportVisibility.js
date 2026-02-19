import { useEffect, useRef } from 'react'

// Returns a ref (not state) so rAF loops can check visibility without triggering re-renders
export function useViewportVisibility(elementRef, options = {}) {
  const { rootMargin = '200px' } = options
  const isVisibleRef = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
      },
      { rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [elementRef, rootMargin])

  return isVisibleRef
}
