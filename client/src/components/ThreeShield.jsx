import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, RoundedBox, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'



// ─── Single iridescent cube with scroll-driven position ───
function IridescentCube({ startPos, scale = 1, rotSpeed = 0.15 }) {
  const meshRef = useRef()
  const smoothPos = useRef(new THREE.Vector3(...startPos))
  const targetPos = useRef(new THREE.Vector3())

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()

    // Rotation: each cube spins independently
    meshRef.current.rotation.x = t * rotSpeed
    meshRef.current.rotation.y = t * rotSpeed * 1.3
    meshRef.current.rotation.z = t * rotSpeed * 0.6

    // Position: stay at startPos
    targetPos.current.set(startPos[0], startPos[1], startPos[2])

    // Smooth interpolation for buttery movement
    smoothPos.current.lerp(targetPos.current, 0.06)
    meshRef.current.position.copy(smoothPos.current)

    // Scale: fixed scale
    meshRef.current.scale.setScalar(scale * 1.3)
  })

  return (
    <RoundedBox ref={meshRef} args={[1, 1, 1]} radius={0.06} smoothness={4}>
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

// Easing function for smooth scroll animation
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ─── The complete cube cluster ───
// START: cubes are far apart, some off-screen (spread/disjoined)
// END: cubes form tight cross cluster (joined)
function CubeCluster() {
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    // Gentle auto-rotation of entire group
    groupRef.current.rotation.y = t * 0.04
    groupRef.current.rotation.x = Math.sin(t * 0.03) * 0.08
  })

  // Each cube: [startPos (spread/off-screen), endPos (joined cross)]
  const cubes = [
    // === CENTER (stays roughly in place) ===
    { start: [0, 0, 2],          end: [0, 0, 0],           scale: 1.2,  rot: 0.12 },

    // === CROSS ARMS — fly in from far away ===
    // Top: flies from way above
    { start: [1, 8, -3],         end: [0, 1.15, 0],        scale: 1.05, rot: 0.15 },
    // Bottom: flies from way below
    { start: [-1.5, -9, -2],     end: [0, -1.15, 0],       scale: 1.05, rot: 0.13 },
    // Left: flies from far left
    { start: [-10, 1, -1],       end: [-1.15, 0, 0],       scale: 1.05, rot: 0.17 },
    // Right: flies from far right
    { start: [10, -0.5, -2],     end: [1.15, 0, 0],        scale: 1.05, rot: 0.14 },
    // Front: flies from behind camera
    { start: [0.5, 0.5, 8],      end: [0, 0, 1.15],        scale: 1.0,  rot: 0.16 },
    // Back: flies from far back
    { start: [-0.5, -1, -10],    end: [0, 0, -1.15],       scale: 1.0,  rot: 0.11 },

    // === DIAGONAL ACCENTS — fly in from corners ===
    { start: [8, 7, 3],          end: [0.95, 0.95, 0],     scale: 0.8,  rot: 0.18 },
    { start: [-9, 7, 2],         end: [-0.95, 0.95, 0],    scale: 0.8,  rot: 0.14 },
    { start: [7, -8, -3],        end: [0.95, -0.95, 0],    scale: 0.75, rot: 0.19 },
    { start: [-8, -7, -4],       end: [-0.95, -0.95, 0],   scale: 0.75, rot: 0.13 },

    // === DEPTH CORNERS — from deep z positions ===
    { start: [5, 3, 9],          end: [0.8, 0, 0.8],       scale: 0.7,  rot: 0.16 },
    { start: [-4, -2, -11],      end: [-0.8, 0, -0.8],     scale: 0.7,  rot: 0.15 },
  ]

  return (
    <group ref={groupRef}>
      {cubes.map((cube, i) => (
        <IridescentCube
          key={i}
          startPos={cube.start}
          scale={cube.scale}
          rotSpeed={cube.rot}
        />
      ))}
    </group>
  )
}

function FloatingParticles() {
  return <Stars radius={120} depth={60} count={5000} factor={4} saturation={0} fade speed={0.8} />
}

// ─── Inner 3D scene ───
function Scene() {
  return (
    <>
      <color attach="background" args={['#020617']} />

      {/* Rich multi-directional lighting for iridescent spectrum */}
      <ambientLight intensity={0.12} />
      <directionalLight position={[5, 5, 5]} intensity={3} color="#c084fc" />
      <directionalLight position={[-5, 3, -5]} intensity={2.5} color="#38bdf8" />
      <directionalLight position={[0, -5, 5]} intensity={2} color="#f472b6" />
      <directionalLight position={[-3, 5, -3]} intensity={1.5} color="#a78bfa" />
      <pointLight position={[4, -2, 4]} intensity={1.5} color="#22d3ee" />
      <pointLight position={[-4, 2, -4]} intensity={1} color="#e879f9" />

      {/* Environment for metallic reflections */}
      <Environment preset="night" />

      <CubeCluster />
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

// ─── Main export: sticky 3D canvas that stays fixed while page scrolls ───
export default function ThreeShield() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 0,
      pointerEvents: 'none',
    }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 2]} style={{ pointerEvents: 'none' }}>
        <Scene />
      </Canvas>
    </div>
  )
}
