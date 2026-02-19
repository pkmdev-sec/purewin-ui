import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const PARTICLE_COLORS = ['#8b5cf6', '#1E88E5', '#00ffd5', '#a78bfa', '#42A5F5', '#b18cff']

function Particles({ count = 500 }) {
  const meshRef = useRef()

  const { positions, colors, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8

      const col = new THREE.Color(PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)])
      colors[i * 3] = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b

      velocities[i * 3] = (Math.random() - 0.5) * 0.005
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005
      velocities[i * 3 + 2] = 0
    }
    return { positions, colors, velocities }
  }, [count])

  const posRef = useRef(positions.slice())

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const pos = posRef.current

    for (let i = 0; i < count; i++) {
      const ix = i * 3, iy = ix + 1

      pos[ix] += velocities[ix] + Math.sin(t * 0.3 + pos[iy] * 0.5) * 0.002
      pos[iy] += velocities[iy] + Math.cos(t * 0.2 + pos[ix] * 0.5) * 0.002

      if (pos[ix] > 10) pos[ix] = -10
      if (pos[ix] < -10) pos[ix] = 10
      if (pos[iy] > 6) pos[iy] = -6
      if (pos[iy] < -6) pos[iy] = 6
    }

    meshRef.current.geometry.attributes.position.array.set(pos)
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

export default function AetherField({ opacity = 1 }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      opacity,
    }}>
      <Canvas
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
      >
        <Particles count={500} />
        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
