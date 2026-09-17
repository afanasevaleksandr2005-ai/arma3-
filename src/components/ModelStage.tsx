import { ContactShadows, Html, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, type ReactNode } from 'react'
import { GLTFModel } from './GLTFModel'
import { ModelErrorBoundary } from './ModelErrorBoundary'

function Loader() {
  return (
    <Html center>
      <div className="text-xs tracking-wide text-neutral-400">Загрузка модели…</div>
    </Html>
  )
}

interface ModelSwitchProps {
  modelUrl?: string
  placeholder: ReactNode
}

/** Renders a real GLB when one is configured, and falls back to the placeholder otherwise. */
function ModelSwitch({ modelUrl, placeholder }: ModelSwitchProps) {
  if (!modelUrl) return <>{placeholder}</>
  return (
    <ModelErrorBoundary fallback={placeholder}>
      <Suspense fallback={<Loader />}>
        <GLTFModel url={modelUrl} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

interface ModelStageProps {
  modelUrl?: string
  placeholder: ReactNode
  cameraTarget?: [number, number, number]
  cameraDistance?: number
}

export function ModelStage({
  modelUrl,
  placeholder,
  cameraTarget = [0, 0, 0],
  cameraDistance = 2.6,
}: ModelStageProps) {
  return (
    <div className="relative h-full w-full">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault fov={35} position={[cameraDistance, cameraDistance * 0.45, cameraDistance]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[3, 4, 2]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, 1.5, -2]} intensity={0.4} color="#d8b24a" />

        <Suspense fallback={<Loader />}>
          <ModelSwitch modelUrl={modelUrl} placeholder={placeholder} />
        </Suspense>

        <ContactShadows position={[0, -0.92, 0]} opacity={0.55} scale={4} blur={2.6} far={2} />
        <OrbitControls
          makeDefault
          target={cameraTarget}
          enablePan={false}
          enableZoom={true}
          minDistance={1.4}
          maxDistance={4.5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </Canvas>
      {!modelUrl && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-neutral-400">
          Превью — финальная модель скоро
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] uppercase tracking-[0.2em] text-neutral-500">
        Зажмите и вращайте — модель полностью в 3D
      </div>
    </div>
  )
}
