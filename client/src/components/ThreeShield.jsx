import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars, Edges } from '@react-three/drei'

// The Quantum Rings / Energy Core
function QuantumRings() {
  const groupRef = useRef()
  const ring1 = useRef()
  const ring2 = useRef()
  const ring3 = useRef()
  const coreRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    
    // Rotate the entire group slowly
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1
    }

    // Fast, complex rotation for the quantum rings
    if (ring1.current) { ring1.current.rotation.x = t * 0.5; ring1.current.rotation.y = t * 0.2 }
    if (ring2.current) { ring2.current.rotation.y = t * 0.6; ring2.current.rotation.z = t * 0.3 }
    if (ring3.current) { ring3.current.rotation.z = t * 0.7; ring3.current.rotation.x = t * 0.4 }
  })

  // Material for the rings (glassy, neon look)
  const ringMaterial = (
    <meshPhysicalMaterial 
      color="#1e40af" 
      emissive="#3b82f6" 
      emissiveIntensity={0.8} 
      roughness={0.1} 
      metalness={0.9} 
      transparent={true} 
      opacity={0.7} 
      clearcoat={1}
      clearcoatRoughness={0.1}
    />
  )

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef}>
        
        {/* Core Energy Sphere */}
        <Sphere ref={coreRef} args={[0.8, 32, 32]}>
          <MeshDistortMaterial 
            color="#60a5fa" 
            emissive="#93c5fd" 
            emissiveIntensity={1.5} 
            distort={0.5} 
            speed={4} 
            transparent
            opacity={0.9}
          />
        </Sphere>

        {/* Ring 1 (X-Axis dominant) */}
        <mesh ref={ring1}>
          <torusGeometry args={[2.0, 0.05, 16, 100]} />
          {ringMaterial}
        </mesh>

        {/* Ring 2 (Y-Axis dominant) */}
        <mesh ref={ring2}>
          <torusGeometry args={[2.4, 0.04, 16, 100]} />
          {ringMaterial}
        </mesh>

        {/* Ring 3 (Z-Axis dominant) */}
        <mesh ref={ring3}>
          <torusGeometry args={[2.8, 0.03, 16, 100]} />
          {ringMaterial}
        </mesh>

      </group>
    </Float>
  )
}

// Particle field responding to mouse moving near it
function FloatingParticles() {
  return (
    <Stars 
      radius={10} 
      depth={50} 
      count={2000} 
      factor={4} 
      saturation={0} 
      fade 
      speed={1} 
    />
  )
}

export default function ThreeShield() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#60a5fa" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#c084fc" />
        
        <QuantumRings />
        <FloatingParticles />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate={false} 
          maxPolarAngle={Math.PI / 2 + 0.2}
          minPolarAngle={Math.PI / 2 - 0.2}
        />
      </Canvas>
    </div>
  )
}
