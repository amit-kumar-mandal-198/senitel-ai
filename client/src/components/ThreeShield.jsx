import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Float, Stars, Icosahedron } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

// The original "Aegis Shield" core — simple geometric polyhedral with a solid pulse core
function OriginalCore() {
  const meshRef = useRef()
  const wireRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (meshRef.current) {
        meshRef.current.rotation.y = t * 0.2
        meshRef.current.rotation.x = t * 0.1
    }
    if (wireRef.current) {
        wireRef.current.rotation.y = t * -0.15
        wireRef.current.rotation.z = t * 0.2
    }
  })

  return (
    <group>
      {/* Central Solid Core */}
      <Sphere ref={meshRef} args={[1.2, 32, 32]}>
        <meshStandardMaterial 
          color="#3b82f6" 
          emissive="#2563eb" 
          emissiveIntensity={2} 
          roughness={0.3}
          metalness={0.8}
        />
      </Sphere>
      
      {/* Inner Wireframe Polyhedral */}
      <Icosahedron ref={wireRef} args={[2.0, 1]}>
        <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.6} />
      </Icosahedron>

      {/* Outer faint protection layer */}
      <Icosahedron args={[2.4, 1]}>
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.15} />
      </Icosahedron>
    </group>
  )
}

function FloatingParticles() {
  return <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
}

export default function ThreeShield() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={['#020617']} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#60a5fa" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <OriginalCore />
        </Float>
        
        <FloatingParticles />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
