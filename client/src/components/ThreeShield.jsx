import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, RoundedBox, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// Single iridescent cube
function IridescentCube({ position, scale = 1, rotationOffset = 0 }) {
  const meshRef = useRef()

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime() + rotationOffset
    meshRef.current.rotation.x = t * 0.12
    meshRef.current.rotation.y = t * 0.18
    meshRef.current.rotation.z = t * 0.08
  })

  return (
    <RoundedBox
      ref={meshRef}
      position={position}
      scale={scale}
      args={[1, 1, 1]}
      radius={0.08}
      smoothness={4}
    >
      <meshPhysicalMaterial
        metalness={1}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.05}
        iridescence={1}
        iridescenceIOR={2.2}
        iridescenceThicknessRange={[100, 600]}
        color="#7c3aed"
        envMapIntensity={3}
        reflectivity={1}
      />
    </RoundedBox>
  )
}

// The full cluster of cubes in a cross/plus arrangement like Threlte
function CubeCluster() {
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    groupRef.current.rotation.y = t * 0.06
    groupRef.current.rotation.x = Math.sin(t * 0.04) * 0.12
  })

  const cubes = [
    // Center core
    { pos: [0, 0, 0], scale: 1.15, offset: 0 },
    // Top & bottom
    { pos: [0, 1.4, 0], scale: 1.0, offset: 0.8 },
    { pos: [0, -1.4, 0], scale: 1.0, offset: 1.6 },
    // Left & right
    { pos: [-1.4, 0, 0], scale: 1.0, offset: 2.4 },
    { pos: [1.4, 0, 0], scale: 1.0, offset: 3.2 },
    // Front & back
    { pos: [0, 0, 1.4], scale: 0.95, offset: 4.0 },
    { pos: [0, 0, -1.4], scale: 0.95, offset: 4.8 },
    // Diagonals (upper)
    { pos: [1.15, 1.15, 0], scale: 0.8, offset: 5.6 },
    { pos: [-1.15, 1.15, 0], scale: 0.8, offset: 6.4 },
    // Diagonals (lower)
    { pos: [1.15, -1.15, 0], scale: 0.75, offset: 7.2 },
    { pos: [-1.15, -1.15, 0], scale: 0.75, offset: 8.0 },
  ]

  return (
    <group ref={groupRef}>
      {cubes.map((cube, i) => (
        <Float
          key={i}
          speed={1.2 + i * 0.08}
          rotationIntensity={0.25}
          floatIntensity={0.3 + (i % 3) * 0.1}
        >
          <IridescentCube
            position={cube.pos}
            scale={cube.scale}
            rotationOffset={cube.offset}
          />
        </Float>
      ))}
    </group>
  )
}

function FloatingParticles() {
  return <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={1} />
}

export default function ThreeShield() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={['#020617']} />

        {/* Multi-color lighting for iridescent spectrum */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={2.5} color="#c084fc" />
        <directionalLight position={[-5, 3, -5]} intensity={2} color="#38bdf8" />
        <directionalLight position={[0, -5, 5]} intensity={1.5} color="#f472b6" />
        <pointLight position={[3, 3, 3]} intensity={1} color="#a78bfa" />
        <pointLight position={[-3, -3, 3]} intensity={0.8} color="#22d3ee" />

        {/* Environment for reflections */}
        <Environment preset="night" />

        <CubeCluster />
        <FloatingParticles />

        <EffectComposer disableNormalPass>
          <Bloom
            luminanceThreshold={0.2}
            mipmapBlur
            intensity={1.0}
            radius={0.7}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
