import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from './useReducedMotion'

export function useLenis() {
	const reduced = useReducedMotion()

	useEffect(() => {
		// Skip smooth scroll on touch devices — native momentum scroll is better
		const isTouch = window.matchMedia('(pointer: coarse)').matches
		if (isTouch || reduced) return

		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			smoothWheel: true,
		})

		function raf(time) {
			lenis.raf(time)
			requestAnimationFrame(raf)
		}

		requestAnimationFrame(raf)

		return () => lenis.destroy()
	}, [reduced])
}
