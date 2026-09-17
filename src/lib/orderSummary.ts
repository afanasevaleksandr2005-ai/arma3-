import type { EquipmentSlot, SectionId, WeaponModel } from '../types'

interface BuildArgs {
  section: SectionId
  weapons: WeaponModel[]
  equipmentSlots: EquipmentSlot[]
  selectedWeaponId: string
  weaponSelection: Record<string, string>
  equipmentSelection: Record<string, string>
}

/** Turns internal ids into a human-readable "Категория: Значение" list for the order form and the backend message. */
export function buildSelectionSummary({
  section,
  weapons,
  equipmentSlots,
  selectedWeaponId,
  weaponSelection,
  equipmentSelection,
}: BuildArgs): { title: string; lines: string[]; selection: Record<string, string> } {
  if (section === 'weapon') {
    const weapon = weapons.find((item) => item.id === selectedWeaponId) ?? weapons[0]
    if (!weapon) return { title: '', lines: [], selection: {} }

    const lines = weapon.categories.map((category) => {
      const optionId = weaponSelection[category.id] ?? category.options[0]?.id
      const option = category.options.find((item) => item.id === optionId) ?? category.options[0]
      return `${category.name}: ${option?.name ?? ''}`
    })
    return {
      title: weapon.name,
      lines,
      selection: { weapon: weapon.id, ...weaponSelection },
    }
  }

  const lines = equipmentSlots.map((slot) => {
    const optionId = equipmentSelection[slot.id] ?? slot.options[0]?.id
    const option = slot.options.find((item) => item.id === optionId) ?? slot.options[0]
    return `${slot.name}: ${option?.name ?? ''}`
  })
  return {
    title: 'Комплект экипировки',
    lines,
    selection: { ...equipmentSelection },
  }
}
