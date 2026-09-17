import { Center, useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

interface Props {
  url: string
}

/** Loads and auto-normalizes a real GLTF/GLB asset once the art team supplies one. */
export function GLTFModel({ url }: Props) {
  const gltf = useGLTF(url)

  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    return 2.2 / maxDim
  }, [gltf.scene])

  return (
    <Center>
      <primitive object={gltf.scene} scale={scale} />
    </Center>
  )
}
