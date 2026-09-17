interface Props {
  weaponId: string
  optic: string
  muzzle: string
  underbarrel: string
  magazine: string
}

const METAL = '#22252b'
const ACCENT: Record<string, string> = {
  ak74: '#5b4a34',
  m4a1: '#2c2f33',
}

/**
 * Procedural stand-in so the section works end-to-end before real weapon art lands.
 * Reads the same category ids the catalog exposes, so swapping in a GLB per weapon
 * later is a drop-in change in ModelStage, not a rewrite of this file.
 */
export function WeaponPlaceholder({ weaponId, optic, muzzle, underbarrel, magazine }: Props) {
  const accent = ACCENT[weaponId] ?? '#3a3a3a'

  return (
    <group position={[0, 0, 0]}>
      {/* receiver */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.16, 0.14]} />
        <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* barrel */}
      <mesh castShadow position={[1.1, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.55, 16]} />
        <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* handguard */}
      <mesh position={[0.75, -0.02, 0]}>
        <boxGeometry args={[0.55, 0.13, 0.13]} />
        <meshStandardMaterial color={accent} roughness={0.6} />
      </mesh>

      {/* pistol grip */}
      <mesh position={[-0.15, -0.22, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.12, 0.3, 0.1]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>

      {/* stock */}
      <mesh position={[-0.95, -0.02, 0]}>
        <boxGeometry args={[0.5, 0.14, 0.1]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>

      {/* magazine */}
      <mesh
        position={[0.05, magazine === 'drum' ? -0.32 : -0.24, 0]}
        rotation={[0, 0, -0.18]}
      >
        <boxGeometry
          args={[
            0.13,
            magazine === 'standard' ? 0.35 : magazine === 'extended' ? 0.5 : 0.4,
            magazine === 'drum' ? 0.22 : 0.1,
          ]}
        />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>

      {/* optic rail */}
      {optic !== 'none' && (
        <mesh position={[0.15, 0.16, 0]}>
          <boxGeometry
            args={[optic === 'acog' || optic === 'pso' ? 0.28 : 0.14, 0.13, 0.11]}
          />
          <meshStandardMaterial color="#0e0e0e" roughness={0.35} metalness={0.5} />
        </mesh>
      )}

      {/* muzzle device */}
      {muzzle !== 'none' && (
        <mesh position={[1.42, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry
            args={[
              muzzle === 'suppressor' ? 0.045 : 0.04,
              muzzle === 'suppressor' ? 0.045 : 0.04,
              muzzle === 'suppressor' ? 0.28 : 0.1,
              16,
            ]}
          />
          <meshStandardMaterial color="#151515" roughness={0.4} metalness={0.6} />
        </mesh>
      )}

      {/* bipod / foregrip */}
      {underbarrel !== 'none' && underbarrel === 'bipod' && (
        <group position={[1.05, -0.14, 0]}>
          <mesh position={[0, 0, 0.08]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[0, 0, -0.08]} rotation={[-0.5, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      )}
      {underbarrel === 'grip' && (
        <mesh position={[0.85, -0.18, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.08, 0.2, 0.08]} />
          <meshStandardMaterial color={accent} roughness={0.7} />
        </mesh>
      )}
    </group>
  )
}
