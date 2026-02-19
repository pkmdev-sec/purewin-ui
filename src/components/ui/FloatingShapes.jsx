import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const SHAPE_CONFIGS = [
  { type: 'icosahedron', count: 5, args: [0.4, 0] },
  { type: 'octahedron', count: 5, args: [0.35, 0] },
  { type: 'tetrahedron', count: 4, args: [0.35, 0] },
  { type: 'torusKnot', count: 3, args: [0.25, 0.08, 64, 16] },
  { type: 'dodecahedron', count: 3, args: [0.3, 0] },
  { type: 'box', count: 3, args: [0.4, 0.4, 0.4] },
  { type: 'torus', count: 3, args: [0.3, 0.1, 16, 32] },
  { type: 'sphere', count: 2, args: [0.3, 16, 16] },
  { type: 'cone', count: 2, args: [0.25, 0.5, 16] },
]

const XP_COLORS = [
  '#4CAF50', '#2E7D32', '#8BC34A',
  '#1E88E5', '#1565C0', '#42A5F5',
  '#00ffd5',
]

function createGeometry(type, args) {
  switch (type) {
    case 'icosahedron': return new THREE.IcosahedronGeometry(...args)
    case 'octahedron': return new THREE.OctahedronGeometry(...args)
    case 'tetrahedron': return new THREE.TetrahedronGeometry(...args)
    case 'torusKnot': return new THREE.TorusKnotGeometry(...args)
    case 'dodecahedron': return new THREE.DodecahedronGeometry(...args)
    case 'box': return new THREE.BoxGeometry(...args)
    case 'torus': return new THREE.TorusGeometry(...args)
    case 'sphere': return new THREE.SphereGeometry(...args)
    case 'cone': return new THREE.ConeGeometry(...args)
    default: return new THREE.SphereGeometry(0.3, 16, 16)
  }
}

function Shape({ type, args, position, color, speed, floatIntensity, scale }) {
  const meshRef = useRef()
  const geometry = useMemo(() => createGeometry(type, args), [type, args])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime * speed
    meshRef.current.rotation.x = t * 0.3
    meshRef.current.rotation.y = t * 0.5
  })

  return (
    <group ref={meshRef} position={position} scale={[scale, scale, scale]}>
      <Float speed={speed * 2} rotationIntensity={0.4} floatIntensity={floatIntensity} floatingRange={[-0.4, 0.4]}>
        <mesh geometry={geometry}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.25}
            metalness={0.4}
            roughness={0.1}
            transparent
            opacity={0.35}
          />
        </mesh>
        <mesh geometry={geometry}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.5}
            wireframe
          />
        </mesh>
      </Float>
    </group>
  )
}

function MouseParallax({ children }) {
  const groupRef = useRef()
  const mouse = useRef({ x: 0, y: 0 })
  const { size } = useThree()

  useEffect(() => {
    function handleMove(e) {
      mouse.current.x = (e.clientX / size.width - 0.5) * 2
      mouse.current.y = (e.clientY / size.height - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [size])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += (mouse.current.x * 0.15 - groupRef.current.rotation.y) * 0.02
    groupRef.current.rotation.x += (-mouse.current.y * 0.1 - groupRef.current.rotation.x) * 0.02
  })

  return <group ref={groupRef}>{children}</group>
}

function Scene() {
  const shapes = useMemo(() => {
    const result = []
    SHAPE_CONFIGS.forEach(({ type, count, args }) => {
      for (let i = 0; i < count; i++) {
        result.push({
          type,
          args,
          position: [
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 7,
            -4 + Math.random() * 5,
          ],
          color: XP_COLORS[Math.floor(Math.random() * XP_COLORS.length)],
          speed: 0.3 + Math.random() * 0.7,
          floatIntensity: 0.3 + Math.random() * 0.7,
          scale: 1.0 + Math.random() * 1.5,
          key: `${type}-${i}`,
        })
      }
    })
    return result
  }, [])

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, 3, 2]} intensity={0.8} color="#1E88E5" />
      <pointLight position={[0, 0, 3]} intensity={1.2} color="#4CAF50" />
      <pointLight position={[3, -3, 2]} intensity={1.0} color="#b18cff" />
      <pointLight position={[-3, 3, 0]} intensity={1.0} color="#00ffd5" />
      <pointLight position={[0, -2, 4]} intensity={0.8} color="#f08b47" />

      <MouseParallax>
        {shapes.map((shape) => (
          <Shape key={shape.key} {...shape} />
        ))}
      </MouseParallax>

      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}

export default function FloatingShapes() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ pointerEvents: 'none' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
