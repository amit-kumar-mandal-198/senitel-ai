import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function HeroMesh({ mouse, scrollProgress }) {
  const groupRef = useRef()
  const targetRot = useRef({ x: 0, y: 0 })

  const mainGeo = useMemo(() => new THREE.IcosahedronGeometry(1.6, 1), [])
  const innerGeo = useMemo(() => new THREE.IcosahedronGeometry(1.5, 1), [])
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.6, 1)), [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    // Idle float
    const floatY = Math.sin(t * 0.6) * 0.12
    const tiltX = Math.sin(t * 0.4) * 0.05
    const baseRotY = t * 0.003

    // Mouse parallax
    const mx = mouse?.current?.x || 0
    const my = mouse?.current?.y || 0

    targetRot.current.y = baseRotY + mx * 0.4
    targetRot.current.x = tiltX - my * 0.2

    // Lerp smooth
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRot.current.y, 0.05)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRot.current.x, 0.05)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, floatY, 0.05)

    // Scroll-driven scale
    const sp = scrollProgress?.current || 0
    const targetScale = 1 - sp * 0.3
    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.05)
    groupRef.current.scale.set(s, s, s)
  })

  return (
    <group ref={groupRef}>
      {/* Main chrome-violet icosahedron */}
      <mesh geometry={mainGeo}>
        <meshPhysicalMaterial
          roughness={0.05}
          metalness={0.9}
          transmission={0.3}
          thickness={1.2}
          envMapIntensity={3.0}
          color="#8B5CF6"
          iridescence={0.8}
          iridescenceIOR={1.3}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          emissive={new THREE.Color('#4c1d95')}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Inner glass shell */}
      <mesh geometry={innerGeo}>
        <meshPhysicalMaterial
          roughness={0.1}
          metalness={0.7}
          transmission={0.5}
          thickness={0.8}
          color="#7c3aed"
          side={THREE.BackSide}
          emissive={new THREE.Color('#4c1d95')}
          emissiveIntensity={0.2}
          opacity={0.6}
          transparent
        />
      </mesh>

      {/* Wireframe overlay */}
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color="#8c5cff" opacity={0.15} transparent />
      </lineSegments>
    </group>
  )
}
