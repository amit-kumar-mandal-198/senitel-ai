import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'

// ─── Lightweight space stars background for dashboard pages ───
// Uses the same Stars config as the landing page ThreeShield,
// but without the heavy 3D cubes, lighting, bloom, or environment.

function SpaceScene() {
  return (
    <>
      <color attach="background" args={['#020617']} />
      <Stars radius={120} depth={60} count={5000} factor={4} saturation={0} fade speed={0.8} />
    </>
  )
}

export default function SpaceBackground() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
    }}>
      <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 1.5]} style={{ pointerEvents: 'none' }}>
        <SpaceScene />
      </Canvas>
    </div>
  )
}
