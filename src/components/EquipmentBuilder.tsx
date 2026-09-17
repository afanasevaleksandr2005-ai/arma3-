import { EQUIPMENT_SLOTS, EQUIPMENT_SECTION_PRICE } from '../data/catalog'
import { useBuilderStore } from '../store/useBuilderStore'
import { MannequinPlaceholder } from './MannequinPlaceholder'
import { ModelStage } from './ModelStage'
import { OptionList } from './OptionList'
import { PriceBar } from './PriceBar'

function colorFor(slotId: string, selection: Record<string, string>): string {
  const slot = EQUIPMENT_SLOTS.find((item) => item.id === slotId)
  const optionId = selection[slotId]
  const option = slot?.options.find((item) => item.id === optionId)
  return option?.previewColor ?? '#00000000'
}

export function EquipmentBuilder() {
  const equipmentSelection = useBuilderStore((s) => s.equipmentSelection)
  const selectEquipmentOption = useBuilderStore((s) => s.selectEquipmentOption)
  const openOrderModal = useBuilderStore((s) => s.openOrderModal)

  return (
    <div className="grid h-full grid-cols-[1fr_320px] gap-5">
      <section className="flex flex-col overflow-hidden rounded-xl border border-white/5 bg-white/[0.015]">
        <div className="border-b border-white/5 px-5 py-4">
          <div className="text-lg font-semibold text-neutral-100">Экипировка персонажа</div>
          <div className="text-xs uppercase tracking-[0.1em] text-neutral-500">
            Форма, броня и снаряжение
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <ModelStage
            cameraDistance={3.4}
            cameraTarget={[0, 0.35, 0]}
            placeholder={
              <MannequinPlaceholder
                uniformColor={colorFor('uniform', equipmentSelection)}
                vest={equipmentSelection.vest ?? 'none'}
                vestColor={colorFor('vest', equipmentSelection)}
                helmet={equipmentSelection.helmet ?? 'none'}
                helmetColor={colorFor('helmet', equipmentSelection)}
                backpack={equipmentSelection.backpack ?? 'none'}
                backpackColor={colorFor('backpack', equipmentSelection)}
                mask={equipmentSelection.mask ?? 'none'}
                maskColor={colorFor('mask', equipmentSelection)}
              />
            }
          />
        </div>
      </section>

      <aside className="flex flex-col gap-5 overflow-y-auto pl-1">
        <div className="flex flex-col gap-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Комплект</h2>
          {EQUIPMENT_SLOTS.map((slot) => (
            <OptionList
              key={slot.id}
              title={slot.name}
              options={slot.options}
              selectedId={equipmentSelection[slot.id] ?? slot.options[0].id}
              onSelect={(optionId) => selectEquipmentOption(slot.id, optionId)}
            />
          ))}
        </div>
        <PriceBar price={EQUIPMENT_SECTION_PRICE} onOrder={openOrderModal} />
      </aside>
    </div>
  )
}
