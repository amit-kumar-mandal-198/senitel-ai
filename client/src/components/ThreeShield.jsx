import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars, Edges, Icosahedron, Points, PointMaterial } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// Generates a ring of scattered data particles
function DataRing({ count, radius }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2
        // Narrow band
        const r = radius + (Math.random() - 0.5) * 0.2
        const y = (Math.random() - 0.5) * 0.1
        p[i * 3] = r * Math.cos(theta)
        p[i * 3 + 1] = y
        p[i * 3 + 2] = r * Math.sin(theta)
    }
    return p
  }, [count, radius])

  const ref = useRef()
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y += 0.002
  })

  return (
    <Points ref={ref} positions={points} frustumCulled={false}>
      <PointMaterial color="#93c5fd" size={0.05} sizeAttenuation transparent opacity={0.8} emissive="#60a5fa" emissiveIntensity={2} />
    </Points>
  )
}

// A highly intricate futuristic ring made of cybernetic grid patterns and data tracks
function CyberRing({ radius, index }) {
  const meshRef = useRef()
  const rotRef = useRef()
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // 3D rotation of the whole ring group
    if (meshRef.current) {
      if (index === 0) { meshRef.current.rotation.x = Math.sin(t*0.2)*0.4; meshRef.current.rotation.y = t * 0.15 }
      if (index === 1) { meshRef.current.rotation.y = Math.cos(t*0.3)*0.5; meshRef.current.rotation.z = t * 0.2 }
      if (index === 2) { meshRef.current.rotation.z = Math.sin(t*0.1)*0.6; meshRef.current.rotation.x = t * 0.05 }
    }
    // Spin the internal elements
    if (rotRef.current) rotRef.current.rotation.y = t * (0.2 + index*0.1);
  })

  return (
    <group ref={meshRef}>
      <group ref={rotRef} rotation-x={Math.PI / 2}>
        
        {/* The Grid Cylinder (creates a futuristic segmented data track) */}
        <mesh>
          <cylinderGeometry args={[radius, radius, 0.4, 64, 1, true]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.15} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[radius+0.05, radius+0.05, 0.1, 32, 1, true]} />
          <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.4} />
        </mesh>

        {/* Thick structural frame */}
        <mesh>
          <torusGeometry args={[radius, 0.02, 16, 128]} />
          <meshPhysicalMaterial color="#020617" emissive="#1e3a8a" emissiveIntensity={0.5} roughness={0.1} metalness={1} />
        </mesh>

        {/* Glowing data stream along the edge */}
        <DataRing count={200} radius={radius} />

      </group>
    </group>
  )
}

function FutureCore() {
  const groupRef = useRef()
  const innerRef = useRef()
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = t * -0.2
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = t * 0.5
      innerRef.current.rotation.z = t * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {/* Intense pulsing plasma core */}
      <Sphere ref={innerRef} args={[1.0, 64, 64]}>
        <MeshDistortMaterial 
          color="#ffffff" 
          emissive="#60a5fa" 
          emissiveIntensity={4} 
          distort={0.6} 
          speed={6} 
        />
      </Sphere>
      
      {/* Geometric cage */}
      <Icosahedron args={[1.3, 1]}>
        <meshBasicMaterial color="#93c5fd" wireframe transparent opacity={0.5} />
      </Icosahedron>
      
      <Icosahedron args={[1.5, 2]}>
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.15} />
      </Icosahedron>
    </group>
  )
}

function FloatingParticles() {
  return <Stars radius={15} depth={50} count={3000} factor={4} saturation={0} fade speed={2} />
}

export default function ThreeShield() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: false }}>
        <color attach="background" args={['#020617']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#60a5fa" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#c084fc" />
        
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={1}>
          <group scale={[0.6, 0.6, 0.6]}>
            <FutureCore />
            <CyberRing radius={2.2} index={0} />
            <CyberRing radius={2.9} index={1} />
            <CyberRing radius={3.6} index={2} />
          </group>
        </Float>
        
        <FloatingParticles />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={2.5} levels={9} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
