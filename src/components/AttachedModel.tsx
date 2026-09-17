import { useGLTF } from '@react-three/drei'
import { Suspense, type ReactNode } from 'react'
import { ModelErrorBoundary } from './ModelErrorBoundary'

interface RawGLTFProps {
  url: string
  scale: number
}

/** Renders a GLB at its native export scale — no auto-centering/normalizing,
 *  so the admin-tuned position/scale for that gear piece is respected as-is. */
function RawGLTF({ url, scale }: RawGLTFProps) {
  const gltf = useGLTF(url)
  return <primitive object={gltf.scene} scale={scale} />
}

interface Props {
  modelUrl?: string | null
  position: [number, number, number]
  scale?: number
  fallback: ReactNode
}

/** A single attachable gear piece (vest, helmet, backpack…) positioned at an
 *  admin-configured anchor. Falls back to the procedural placeholder mesh if
 *  no model is set yet, or if the model fails to load. */
export function AttachedModel({ modelUrl, position, scale = 1, fallback }: Props) {
  if (!modelUrl) {
    return <group position={position}>{fallback}</group>
  }
  return (
    <group position={position}>
      <ModelErrorBoundary fallback={fallback}>
        <Suspense fallback={null}>
          <RawGLTF url={modelUrl} scale={scale} />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  )
}
