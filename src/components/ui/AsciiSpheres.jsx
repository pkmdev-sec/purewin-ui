import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

function SimpleFloat({ speed = 1, rotationIntensity = 0.5, floatIntensity = 0.8, children }) {
  const groupRef = useRef()
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.position.y = Math.sin(t * speed) * floatIntensity * 0.5
    groupRef.current.rotation.x += Math.sin(t * speed * 0.7) * rotationIntensity * 0.001
    groupRef.current.rotation.z += Math.cos(t * speed * 0.5) * rotationIntensity * 0.0005
  })
  return <group ref={groupRef}>{children}</group>
}

function FloatingSphere({ position, size, color, speed, paused }) {
  const ref = useRef()
  useFrame((state) => {
    if (paused || !ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * speed * 0.2
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.3
  })
  return (
    <SimpleFloat speed={speed} rotationIntensity={0.5} floatIntensity={0.8}>
      <group ref={ref} position={position}>
        <mesh>
          <sphereGeometry args={[size, 12, 8]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.12} />
        </mesh>
        <mesh>
          <sphereGeometry args={[size * 0.92, 8, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} transparent opacity={0.04} />
        </mesh>
      </group>
    </SimpleFloat>
  )
}

function FloatingTorus({ position, size, color, speed, paused }) {
  const ref = useRef()
  useFrame((state) => {
    if (paused || !ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * speed * 0.4
    ref.current.rotation.z = state.clock.elapsedTime * speed * 0.2
  })
  return (
    <SimpleFloat speed={speed * 0.8} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={ref} position={position}>
        <torusGeometry args={[size, size * 0.3, 8, 24]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.1} />
      </mesh>
    </SimpleFloat>
  )
}

function FloatingOcta({ position, size, color, speed, paused }) {
  const ref = useRef()
  useFrame((state) => {
    if (paused || !ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.5
    ref.current.rotation.x = state.clock.elapsedTime * speed * 0.2
  })
  return (
    <SimpleFloat speed={speed * 1.2} rotationIntensity={0.6} floatIntensity={1.0}>
      <group ref={ref} position={position}>
        <mesh>
          <octahedronGeometry args={[size, 0]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.15} />
        </mesh>
        <mesh scale={0.85}>
          <octahedronGeometry args={[size, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.08} transparent opacity={0.03} />
        </mesh>
      </group>
    </SimpleFloat>
  )
}

const OBJECTS = [
  { type: 'sphere', position: [-4.5, 1.5, -2], size: 1.1, color: '#1a4a2e', speed: 0.4 },
  { type: 'sphere', position: [4.2, -1.2, -3], size: 0.8, color: '#0a2040', speed: 0.6 },
  { type: 'torus', position: [-2.5, -2, -1.5], size: 0.9, color: '#152030', speed: 0.5 },
  { type: 'torus', position: [3.5, 2, -2.5], size: 1.3, color: '#1a3a1a', speed: 0.3 },
  { type: 'octa', position: [0.5, 2.5, -2], size: 0.7, color: '#2a1a40', speed: 0.7 },
  { type: 'octa', position: [-3.8, -0.5, -2], size: 1.0, color: '#0a1a30', speed: 0.45 },
  { type: 'sphere', position: [1.8, -2.8, -3], size: 1.4, color: '#102a1a', speed: 0.35 },
  { type: 'torus', position: [-1, 1, -4], size: 1.6, color: '#1a1a30', speed: 0.25 },
  { type: 'sphere', position: [2.5, 2.8, -3], size: 0.9, color: '#1a2a40', speed: 0.55 },
  { type: 'sphere', position: [-1.5, -3, -4], size: 1.2, color: '#2a1a3a', speed: 0.38 },
  { type: 'torus', position: [5, 0, -2], size: 1.1, color: '#1a1a2e', speed: 0.42 },
  { type: 'octa', position: [-5, 2, -3], size: 0.8, color: '#0a2030', speed: 0.6 },
  { type: 'torus', position: [0, 3.5, -5], size: 1.5, color: '#1a2a1a', speed: 0.28 },
  { type: 'sphere', position: [3, -2.5, -2.5], size: 0.7, color: '#2a1a1a', speed: 0.65 },
]

function Scene({ paused }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 3]} intensity={0.5} color="#1E88E5" />
      <pointLight position={[-5, -3, 2]} intensity={0.4} color="#8b5cf6" />
      {OBJECTS.map((obj, i) => {
        if (obj.type === 'sphere') return <FloatingSphere key={i} {...obj} paused={paused} />
        if (obj.type === 'torus') return <FloatingTorus key={i} {...obj} paused={paused} />
        if (obj.type === 'octa') return <FloatingOcta key={i} {...obj} paused={paused} />
        return null
      })}
      {!paused && (
        <EffectComposer>
          <Bloom intensity={0.3} luminanceThreshold={0.5} luminanceSmoothing={0.9} mipmapBlur />
        </EffectComposer>
      )}
    </>
  )
}

export default function AsciiSpheres({ style = {} }) {
  const containerRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', contain: 'layout paint', ...style }}>
      <Canvas
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6], fov: 55 }}
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
      >
        <Scene paused={!visible} />
      </Canvas>
    </div>
  )
}
