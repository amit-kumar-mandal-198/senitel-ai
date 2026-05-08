import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { Vector2 } from 'three'
import { useMemo } from 'react'

export default function PostFX({ lowPower = false }) {
  const offset = useMemo(() => new Vector2(0.0008, 0.0008), [])

  if (lowPower) return null

  return (
    <EffectComposer>
      <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
      <ChromaticAberration offset={offset} />
      <Noise opacity={0.035} />
      <Vignette eskil={false} offset={0.15} darkness={0.8} />
    </EffectComposer>
  )
}
