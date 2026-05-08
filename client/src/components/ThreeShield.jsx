import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Stars, RoundedBox, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// ─── Scroll progress tracker (0 = top, 1 = scrolled far) ───
function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      // Map scroll to 0–1 over the first 800px of scrolling
      const scrollY = window.scrollY
      const maxScroll = 800
      setProgress(Math.min(scrollY / maxScroll, 1))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return progress
}

// ─── Single Iridescent Cube ───
function IridescentCube({ basePosition, explodedPosition, scrollProgress, scale = 1, rotationOffset = 0 }) {
  const meshRef = useRef()
  const currentPos = useRef(new THREE.Vector3(...basePosition))
  const targetPos = useRef(new THREE.Vector3())

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime() + rotationOffset

    // Smoothly interpolate rotation
    meshRef.current.rotation.x = t * 0.15
    meshRef.current.rotation.y = t * 0.2
    meshRef.current.rotation.z = t * 0.08

    // Interpolate position based on scroll: joined (base) → exploded
    targetPos.current.set(
      THREE.MathUtils.lerp(basePosition[0], explodedPosition[0], scrollProgress),
      THREE.MathUtils.lerp(basePosition[1], explodedPosition[1], scrollProgress),
      THREE.MathUtils.lerp(basePosition[2], explodedPosition[2], scrollProgress),
    )

    // Smooth the movement
    currentPos.current.lerp(targetPos.current, 0.08)
    meshRef.current.position.copy(currentPos.current)

    // Scale down slightly as cubes spread
    const scaleMultiplier = THREE.MathUtils.lerp(1, 0.7, scrollProgress)
    meshRef.current.scale.setScalar(scale * scaleMultiplier)
  })

  return (
    <RoundedBox
      ref={meshRef}
      args={[1, 1, 1]}
      radius={0.06}
      smoothness={4}
    >
      <meshPhysicalMaterial
        metalness={1}
        roughness={0.02}
        clearcoat={1}
        clearcoatRoughness={0.03}
        iridescence={1}
        iridescenceIOR={2.4}
        iridescenceThicknessRange={[100, 800]}
        color="#9966ff"
        envMapIntensity={4}
        reflectivity={1}
        sheen={1}
        sheenColor="#ff66cc"
        sheenRoughness={0.2}
      />
    </RoundedBox>
  )
}

// ─── The full cube cluster with scroll-driven join/explode ───
function CubeCluster({ scrollProgress }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    // Slow auto-rotation of the entire group
    groupRef.current.rotation.y = t * 0.06 + scrollProgress * Math.PI * 0.3
    groupRef.current.rotation.x = Math.sin(t * 0.04) * 0.1 + scrollProgress * 0.3
  })

  // Define each cube's joined (compact) and exploded (spread) positions
  const cubes = [
    // === Center core ===
    { base: [0, 0, 0],           exploded: [0, 0, 0],             scale: 1.2,  offset: 0 },
    // === Cross arms (6 directions) ===
    { base: [0, 1.08, 0],        exploded: [0, 3.5, 0],           scale: 1.05, offset: 0.8 },
    { base: [0, -1.08, 0],       exploded: [0, -3.5, 0],          scale: 1.05, offset: 1.6 },
    { base: [-1.08, 0, 0],       exploded: [-3.5, 0, 0],          scale: 1.05, offset: 2.4 },
    { base: [1.08, 0, 0],        exploded: [3.5, 0, 0],           scale: 1.05, offset: 3.2 },
    { base: [0, 0, 1.08],        exploded: [0, 0, 3.5],           scale: 1.0,  offset: 4.0 },
    { base: [0, 0, -1.08],       exploded: [0, 0, -3.5],          scale: 1.0,  offset: 4.8 },
    // === Diagonal accents ===
    { base: [0.9, 0.9, 0],       exploded: [2.8, 2.8, 0],         scale: 0.8,  offset: 5.6 },
    { base: [-0.9, 0.9, 0],      exploded: [-2.8, 2.8, 0],        scale: 0.8,  offset: 6.4 },
    { base: [0.9, -0.9, 0],      exploded: [2.8, -2.8, 0],        scale: 0.75, offset: 7.2 },
    { base: [-0.9, -0.9, 0],     exploded: [-2.8, -2.8, 0],       scale: 0.75, offset: 8.0 },
    // === Depth diagonals ===
    { base: [0.8, 0, 0.8],       exploded: [2.5, 0.5, 2.5],       scale: 0.7,  offset: 8.8 },
    { base: [-0.8, 0, -0.8],     exploded: [-2.5, -0.5, -2.5],    scale: 0.7,  offset: 9.6 },
  ]

  return (
    <group ref={groupRef}>
      {cubes.map((cube, i) => (
        <IridescentCube
          key={i}
          basePosition={cube.base}
          explodedPosition={cube.exploded}
          scrollProgress={scrollProgress}
          scale={cube.scale}
          rotationOffset={cube.offset}
        />
      ))}
    </group>
  )
}

function FloatingParticles() {
  return <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={1} />
}

// ─── Inner scene that reads scroll progress ───
function Scene({ scrollProgress }) {
  return (
    <>
      <color attach="background" args={['#020617']} />

      {/* Rich multi-directional lighting for max iridescence */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={3} color="#c084fc" />
      <directionalLight position={[-5, 3, -5]} intensity={2.5} color="#38bdf8" />
      <directionalLight position={[0, -5, 5]} intensity={2} color="#f472b6" />
      <directionalLight position={[-3, 5, -3]} intensity={1.5} color="#a78bfa" />
      <pointLight position={[4, -2, 4]} intensity={1.5} color="#22d3ee" />
      <pointLight position={[-4, 2, -4]} intensity={1} color="#e879f9" />

      {/* HDR environment for reflections */}
      <Environment preset="night" />

      <CubeCluster scrollProgress={scrollProgress} />
      <FloatingParticles />

      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={0.15}
          mipmapBlur
          intensity={1.5}
          radius={0.75}
        />
      </EffectComposer>
    </>
  )
}

// ─── Main export ───
export default function ThreeShield() {
  const scrollProgress = useScrollProgress()

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 2]}>
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  )
}
