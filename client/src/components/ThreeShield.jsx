import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars, Edges } from '@react-three/drei'

// The core AI Brain/Shield shape
function SentinelCore() {
  const meshRef = useRef()

  // Slowly rotate the entire core
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.x += 0.002
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2, 0]} />
        <meshPhysicalMaterial 
          color="#1e40af" 
          emissive="#2563eb" 
          emissiveIntensity={0.5} 
          roughness={0.2} 
          metalness={0.8} 
          wireframe={false} 
          transparent={true} 
          opacity={0.8} 
        />
        <Edges scale={1.05} color="#60a5fa" />
        
        {/* Inner glowing sphere */}
        <Sphere args={[1.2, 32, 32]}>
          <MeshDistortMaterial 
            color="#60a5fa" 
            emissive="#93c5fd" 
            emissiveIntensity={1} 
            distort={0.4} 
            speed={3} 
          />
        </Sphere>
      </mesh>
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
        
        <SentinelCore />
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
