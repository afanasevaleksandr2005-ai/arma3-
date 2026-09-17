import { WEAPONS, WEAPON_SECTION_PRICE } from '../data/catalog'
import { useBuilderStore } from '../store/useBuilderStore'
import { ModelStage } from './ModelStage'
import { OptionList } from './OptionList'
import { PriceBar } from './PriceBar'
import { WeaponPlaceholder } from './WeaponPlaceholder'

export function WeaponBuilder() {
  const selectedWeaponId = useBuilderStore((s) => s.selectedWeaponId)
  const weaponSelection = useBuilderStore((s) => s.weaponSelection)
  const selectWeapon = useBuilderStore((s) => s.selectWeapon)
  const selectWeaponAttachment = useBuilderStore((s) => s.selectWeaponAttachment)
  const openOrderModal = useBuilderStore((s) => s.openOrderModal)

  const weapon = WEAPONS.find((item) => item.id === selectedWeaponId) ?? WEAPONS[0]

  return (
    <div className="grid h-full grid-cols-[220px_1fr_320px] gap-5">
      <aside className="flex flex-col gap-2 overflow-y-auto pr-1">
        {WEAPONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectWeapon(item.id)}
            className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
              item.id === selectedWeaponId
                ? 'border-amber-400/60 bg-amber-400/10 text-amber-300'
                : 'border-white/5 bg-white/[0.02] text-neutral-300 hover:border-white/15'
            }`}
          >
            <div className="text-sm font-medium">{item.name}</div>
          </button>
        ))}
      </aside>

      <section className="flex flex-col overflow-hidden rounded-xl border border-white/5 bg-white/[0.015]">
        <div className="border-b border-white/5 px-5 py-4">
          <div className="text-lg font-semibold text-neutral-100">{weapon.name}</div>
          <div className="text-xs uppercase tracking-[0.1em] text-neutral-500">{weapon.description}</div>
          <div className="text-xs text-neutral-500">{weapon.subtitle}</div>
        </div>
        <div className="min-h-0 flex-1">
          <ModelStage
            modelUrl={weapon.modelUrl}
            placeholder={
              <WeaponPlaceholder
                weaponId={weapon.id}
                optic={weaponSelection.optic ?? 'none'}
                muzzle={weaponSelection.muzzle ?? 'none'}
                underbarrel={weaponSelection.underbarrel ?? 'none'}
                magazine={weaponSelection.magazine ?? 'standard'}
              />
            }
          />
        </div>
      </section>

      <aside className="flex flex-col gap-5 overflow-y-auto pl-1">
        <div className="flex flex-col gap-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Сборка</h2>
          {weapon.categories.map((category) => (
            <OptionList
              key={category.id}
              title={category.name}
              options={category.options}
              selectedId={weaponSelection[category.id] ?? category.options[0].id}
              onSelect={(optionId) => selectWeaponAttachment(category.id, optionId)}
            />
          ))}
        </div>
        <PriceBar price={WEAPON_SECTION_PRICE} onOrder={openOrderModal} />
      </aside>
    </div>
  )
}
