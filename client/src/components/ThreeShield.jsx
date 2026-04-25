import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars, Edges, Icosahedron } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

// A single complex ring composed of multiple overlapping torus geometries to look like sci-fi machinery
function ComplexRing({ radius, index }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // Independent rotation speeds based on the ring index
    if (meshRef.current) {
      if (index === 0) { meshRef.current.rotation.x = t * 0.3; meshRef.current.rotation.y = t * 0.1 }
      if (index === 1) { meshRef.current.rotation.y = t * 0.4; meshRef.current.rotation.z = t * 0.2 }
      if (index === 2) { meshRef.current.rotation.z = t * 0.5; meshRef.current.rotation.x = t * 0.3 }
    }
  })

  return (
    <group ref={meshRef}>
      {/* Base glassy dark ring */}
      <mesh>
        <torusGeometry args={[radius, 0.08, 16, 100]} />
        <meshPhysicalMaterial 
          color="#0f172a" 
          metalness={0.9} 
          roughness={0.1} 
          transparent 
          opacity={0.8} 
        />
      </mesh>
      
      {/* Bright emissive inner track */}
      <mesh>
        <torusGeometry args={[radius, 0.03, 16, 100]} />
        <meshPhysicalMaterial 
          color="#60a5fa" 
          emissive="#3b82f6" 
          emissiveIntensity={2} 
          wireframe={true} 
        />
      </mesh>

      {/* Cyber edge highlights */}
      <mesh>
        <torusGeometry args={[radius + 0.01, 0.09, 8, 50]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.1} wireframe />
      </mesh>
    </group>
  )
}

// The core AI Brain/Shield shape
function QuantumRings() {
  const groupRef = useRef()
  const coreRef = useRef()

  // Slowly rotate the entire system
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef} scale={[0.55, 0.55, 0.55]}>
        
        {/* The intense energy core */}
        <group>
          {/* Inner solid plasma */}
          <Sphere ref={coreRef} args={[1.2, 64, 64]}>
            <MeshDistortMaterial 
              color="#ffffff" 
              emissive="#60a5fa" 
              emissiveIntensity={3} 
              distort={0.4} 
              speed={5} 
            />
          </Sphere>
          
          {/* Outer wireframe shell containing the plasma */}
          <Icosahedron args={[1.5, 2]}>
            <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.3} />
          </Icosahedron>
        </group>

        {/* The interlocking quantum rings */}
        <ComplexRing radius={2.5} index={0} />
        <ComplexRing radius={3.2} index={1} />
        <ComplexRing radius={3.9} index={2} />

      </group>
    </Float>
  )
}

function FloatingParticles() {
  // Enhanced particles with more depth
  return (
    <Stars 
      radius={20} 
      depth={50} 
      count={4000} 
      factor={4} 
      saturation={0} 
      fade 
      speed={2} 
    />
  )
}

export default function ThreeShield() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
      {/* We add flat to fix color rendering issues with postprocessing */}
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ antialias: false }}>
        <color attach="background" args={['#020617']} />
        
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

        {/* Post-processing effects to create intense cyber glow */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={1} 
            mipmapBlur 
            intensity={1.5} 
            levels={8}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
