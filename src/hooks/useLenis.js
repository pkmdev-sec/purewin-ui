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

		let rafId = null
		let running = false

		function raf(time) {
			lenis.raf(time)
			if (lenis.isScrolling) {
				rafId = requestAnimationFrame(raf)
			} else {
				running = false
				rafId = null
			}
		}

		function startLoop() {
			if (running) return
			running = true
			rafId = requestAnimationFrame(raf)
		}

		// Lenis emits 'scroll' when scroll starts
		lenis.on('scroll', startLoop)
		// Also listen for wheel/touch to kick-start on first interaction
		window.addEventListener('wheel', startLoop, { passive: true })
		window.addEventListener('touchstart', startLoop, { passive: true })

		// Start initially in case page loads mid-scroll
		startLoop()

		return () => {
			if (rafId) cancelAnimationFrame(rafId)
			window.removeEventListener('wheel', startLoop)
			window.removeEventListener('touchstart', startLoop)
			lenis.destroy()
		}
	}, [reduced])
}