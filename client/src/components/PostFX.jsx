import { EffectComposer, Bloom } from '@react-three/postprocessing'

export default function PostFX({ lowPower = false }) {
  if (lowPower) return null

  return (
    <EffectComposer disableNormalPass>
      <Bloom intensity={1.2} luminanceThreshold={0.25} luminanceSmoothing={0.9} mipmapBlur />
    </EffectComposer>
  )
}
