interface BodyProps {
  uniformColor: string
}

/** The base character mesh — always shown unless the selected uniform has its
 *  own full-body model. Gear pieces (vest/helmet/…) layer on top of this. */
export function MannequinBody({ uniformColor }: BodyProps) {
  const skin = '#c9a37b'

  return (
    <group>
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial color={skin} roughness={0.8} />
      </mesh>

      <mesh position={[0, 1.2, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.5, 8, 16]} />
        <meshStandardMaterial color={uniformColor} roughness={0.75} />
      </mesh>

      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[0.4, 0.18, 0.24]} />
        <meshStandardMaterial color={uniformColor} roughness={0.75} />
      </mesh>

      <mesh position={[-0.34, 1.15, 0]} rotation={[0, 0, 0.12]} castShadow>
        <capsuleGeometry args={[0.075, 0.55, 8, 16]} />
        <meshStandardMaterial color={uniformColor} roughness={0.75} />
      </mesh>
      <mesh position={[0.34, 1.15, 0]} rotation={[0, 0, -0.12]} castShadow>
        <capsuleGeometry args={[0.075, 0.55, 8, 16]} />
        <meshStandardMaterial color={uniformColor} roughness={0.75} />
      </mesh>

      <mesh position={[-0.13, 0.28, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.8} />
      </mesh>
      <mesh position={[0.13, 0.28, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function VestPiece({ color }: { color: string }) {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.46, 0.42, 0.18]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  )
}

export function HelmetPiece({ color }: { color: string }) {
  return (
    <mesh castShadow>
      <sphereGeometry args={[0.17, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.15} />
    </mesh>
  )
}

export function MaskPiece({ color }: { color: string }) {
  return (
    <mesh>
      <boxGeometry args={[0.16, 0.1, 0.06]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  )
}

export function BackpackPiece({ color }: { color: string }) {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.34, 0.5, 0.2]} />
      <meshStandardMaterial color={color} roughness={0.75} />
    </mesh>
  )
}
