interface Props {
  uniformColor: string
  vest: string
  vestColor: string
  helmet: string
  helmetColor: string
  backpack: string
  backpackColor: string
  mask: string
  maskColor: string
}

/**
 * Procedural mannequin stand-in for the equipment section. Reads the same slot ids
 * the catalog exposes, so it stays wired up once real rigged character/gear models
 * replace these primitives.
 */
export function MannequinPlaceholder({
  uniformColor,
  vest,
  vestColor,
  helmet,
  helmetColor,
  backpack,
  backpackColor,
  mask,
  maskColor,
}: Props) {
  const skin = '#c9a37b'

  return (
    <group position={[0, -0.9, 0]}>
      {/* head */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial color={skin} roughness={0.8} />
      </mesh>

      {/* torso */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.5, 8, 16]} />
        <meshStandardMaterial color={uniformColor} roughness={0.75} />
      </mesh>

      {/* hips */}
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[0.4, 0.18, 0.24]} />
        <meshStandardMaterial color={uniformColor} roughness={0.75} />
      </mesh>

      {/* arms */}
      <mesh position={[-0.34, 1.15, 0]} rotation={[0, 0, 0.12]} castShadow>
        <capsuleGeometry args={[0.075, 0.55, 8, 16]} />
        <meshStandardMaterial color={uniformColor} roughness={0.75} />
      </mesh>
      <mesh position={[0.34, 1.15, 0]} rotation={[0, 0, -0.12]} castShadow>
        <capsuleGeometry args={[0.075, 0.55, 8, 16]} />
        <meshStandardMaterial color={uniformColor} roughness={0.75} />
      </mesh>

      {/* legs */}
      <mesh position={[-0.13, 0.28, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.8} />
      </mesh>
      <mesh position={[0.13, 0.28, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.8} />
      </mesh>

      {/* vest */}
      {vest !== 'none' && (
        <mesh position={[0, 1.24, 0.05]} castShadow>
          <boxGeometry args={[0.46, 0.42, 0.18]} />
          <meshStandardMaterial color={vestColor} roughness={0.7} />
        </mesh>
      )}

      {/* helmet */}
      {helmet !== 'none' && (
        <mesh position={[0, 1.68, 0]} castShadow>
          <sphereGeometry args={[0.17, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color={helmetColor} roughness={0.55} metalness={0.15} />
        </mesh>
      )}

      {/* mask */}
      {mask !== 'none' && (
        <mesh position={[0, 1.58, 0.13]}>
          <boxGeometry args={[0.16, 0.1, 0.06]} />
          <meshStandardMaterial color={maskColor} roughness={0.6} />
        </mesh>
      )}

      {/* backpack */}
      {backpack !== 'none' && (
        <mesh position={[0, 1.22, -0.22]} castShadow>
          <boxGeometry args={[0.34, 0.5, 0.2]} />
          <meshStandardMaterial color={backpackColor} roughness={0.75} />
        </mesh>
      )}
    </group>
  )
}
