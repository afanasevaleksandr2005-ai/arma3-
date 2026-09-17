import type { EquipmentOption, EquipmentSlot } from '../types'
import { AttachedModel } from './AttachedModel'
import { BackpackPiece, HelmetPiece, MannequinBody, MaskPiece, VestPiece } from './MannequinPlaceholder'

function findOption(
  slots: EquipmentSlot[],
  slotId: string,
  selection: Record<string, string>,
): EquipmentOption | undefined {
  const slot = slots.find((item) => item.id === slotId)
  return slot?.options.find((item) => item.id === selection[slotId])
}

function anchorOf(option: EquipmentOption | undefined): [number, number, number] {
  return [option?.offset?.x ?? 0, option?.offset?.y ?? 0, option?.offset?.z ?? 0]
}

/** Composites the character mannequin with whichever gear pieces are selected —
 *  a real uploaded .glb per piece when set, a procedural placeholder otherwise.
 *  Shared by the public builder and the admin editor's live preview. */
export function EquipmentScene({
  slots,
  selection,
}: {
  slots: EquipmentSlot[]
  selection: Record<string, string>
}) {
  const uniform = findOption(slots, 'uniform', selection)
  const vest = findOption(slots, 'vest', selection)
  const helmet = findOption(slots, 'helmet', selection)
  const backpack = findOption(slots, 'backpack', selection)
  const mask = findOption(slots, 'mask', selection)

  return (
    <group position={[0, -0.9, 0]}>
      {uniform?.modelUrl ? (
        <AttachedModel
          modelUrl={uniform.modelUrl}
          position={anchorOf(uniform)}
          scale={uniform.scale}
          fallback={<MannequinBody uniformColor={uniform.previewColor} />}
        />
      ) : (
        <MannequinBody uniformColor={uniform?.previewColor ?? '#4b5a3a'} />
      )}

      {vest && vest.id !== 'none' && (
        <AttachedModel
          modelUrl={vest.modelUrl}
          position={anchorOf(vest)}
          scale={vest.scale}
          fallback={<VestPiece color={vest.previewColor} />}
        />
      )}

      {helmet && helmet.id !== 'none' && (
        <AttachedModel
          modelUrl={helmet.modelUrl}
          position={anchorOf(helmet)}
          scale={helmet.scale}
          fallback={<HelmetPiece color={helmet.previewColor} />}
        />
      )}

      {backpack && backpack.id !== 'none' && (
        <AttachedModel
          modelUrl={backpack.modelUrl}
          position={anchorOf(backpack)}
          scale={backpack.scale}
          fallback={<BackpackPiece color={backpack.previewColor} />}
        />
      )}

      {mask && mask.id !== 'none' && (
        <AttachedModel
          modelUrl={mask.modelUrl}
          position={anchorOf(mask)}
          scale={mask.scale}
          fallback={<MaskPiece color={mask.previewColor} />}
        />
      )}
    </group>
  )
}
