import { useEffect, useRef } from 'react'

// Returns a ref (not state) so rAF loops can check visibility without triggering re-renders
export function useViewportVisibility(elementRef, options = {}) {
  const { rootMargin = '200px', onBecomeVisible } = options
  const isVisibleRef = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisibleRef.current
        isVisibleRef.current = entry.isIntersecting
        if (!wasVisible && entry.isIntersecting && onBecomeVisible) {
          onBecomeVisible()
        }
      },
      { rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [elementRef, rootMargin, onBecomeVisible])

  return isVisibleRef
}
