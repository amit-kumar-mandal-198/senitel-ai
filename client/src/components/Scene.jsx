import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, Preload } from '@react-three/drei'
import { Suspense, useEffect, useState, memo } from 'react'
import * as THREE from 'three'
import HeroMesh from './HeroMesh'
import PostFX from './PostFX'

function Lights() {
  return (
    <>
      <ambientLight intensity={0.2} color="#1a0a3d" />
      <directionalLight position={[5, 8, 3]} intensity={1.5} color="#ffffff" castShadow />
      <pointLight position={[-3, 2, 4]} intensity={3} color="#7c3aed" />
      <pointLight position={[3, -2, -4]} intensity={2} color="#2563eb" />
      <pointLight position={[0, 6, 0]} intensity={1} color="#ffffff" />
      <rectAreaLight
        position={[-4, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={4}
        height={4}
        color="#4f46e5"
        intensity={8}
      />
    </>
  )
}

function CameraRig({ mouse, scrollProgress }) {
  const { camera } = useThree()

  useFrame(() => {
    const mx = mouse?.current?.x || 0
    const my = mouse?.current?.y || 0
    const sp = scrollProgress?.current || 0

    // Mouse parallax on camera
    const targetX = mx * 0.8
    const targetY = -my * 0.5

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.04)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04)

    // Scroll dolly
    const targetZ = 3.5 + sp * 2.5
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05)
  })

  return null
}

function SceneContent({ mouse, scrollProgress, onReady }) {
  const [lowPower, setLowPower] = useState(false)

  useEffect(() => {
    if (navigator.hardwareConcurrency < 4) setLowPower(true)
    const t = setTimeout(() => onReady?.(), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <Lights />
      <HeroMesh mouse={mouse} scrollProgress={scrollProgress} />
      <CameraRig mouse={mouse} scrollProgress={scrollProgress} />
      <Environment preset="city" />
      <PostFX lowPower={lowPower} />
      <Preload all />
    </>
  )
}

const MemoContent = memo(SceneContent)

export default function Scene({ mouse, scrollProgress, onReady }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  return (
    <Canvas
      camera={{ fov: 60, near: 0.1, far: 100, position: [0, 0, 3.5] }}
      style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0a0F19']} />
      <fog attach="fog" args={['#0a0F19', 8, 20]} />

      <Suspense fallback={null}>
        <MemoContent mouse={mouse} scrollProgress={scrollProgress} onReady={onReady} />
      </Suspense>

      <OrbitControls
        autoRotate={!isMobile}
        autoRotateSpeed={0.4}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2 + 0.2}
        makeDefault
      />
    </Canvas>
  )
}
