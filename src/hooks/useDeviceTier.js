import { useMemo } from 'react'

/**
 * Returns 'high' | 'mid' | 'low' based on device capabilities.
 * Evaluated once at mount (capabilities don't change mid-session).
 */
export function useDeviceTier() {
	return useMemo(() => getDeviceTier(), [])
}

export function getDeviceTier() {
	if (typeof window === 'undefined') return 'high'

	const cores = navigator.hardwareConcurrency || 4
	const memory = navigator.deviceMemory || 8 // default high for desktop
	const connection = navigator.connection?.effectiveType
	const isTouch = window.matchMedia('(pointer: coarse)').matches

	// Low tier: few cores, little memory, or slow connection
	if (cores <= 2 || memory <= 2 || connection === '2g' || connection === 'slow-2g') {
		return 'low'
	}

	// Mid tier: touch device with moderate specs, or 3G connection
	if (
		(isTouch && (cores <= 4 || memory <= 4)) ||
		connection === '3g'
	) {
		return 'mid'
	}

	return 'high'
}
