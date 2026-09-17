import { create } from 'zustand'
import { EQUIPMENT_SLOTS, WEAPONS } from '../data/catalog'
import type { SectionId } from '../types'

function defaultWeaponSelection(weaponId: string): Record<string, string> {
  const weapon = WEAPONS.find((item) => item.id === weaponId)
  if (!weapon) return {}
  return Object.fromEntries(
    weapon.categories.map((category) => [category.id, category.options[0].id]),
  )
}

function defaultEquipmentSelection(): Record<string, string> {
  return Object.fromEntries(EQUIPMENT_SLOTS.map((slot) => [slot.id, slot.options[0].id]))
}

interface BuilderState {
  activeSection: SectionId
  selectedWeaponId: string
  weaponSelection: Record<string, string>
  equipmentSelection: Record<string, string>
  orderModalOpen: boolean

  setActiveSection: (section: SectionId) => void
  selectWeapon: (weaponId: string) => void
  selectWeaponAttachment: (categoryId: string, optionId: string) => void
  selectEquipmentOption: (slotId: string, optionId: string) => void
  openOrderModal: () => void
  closeOrderModal: () => void
}

export const useBuilderStore = create<BuilderState>((set) => ({
  activeSection: 'weapon',
  selectedWeaponId: WEAPONS[0].id,
  weaponSelection: defaultWeaponSelection(WEAPONS[0].id),
  equipmentSelection: defaultEquipmentSelection(),
  orderModalOpen: false,

  setActiveSection: (section) => set({ activeSection: section }),

  selectWeapon: (weaponId) =>
    set({
      selectedWeaponId: weaponId,
      weaponSelection: defaultWeaponSelection(weaponId),
    }),

  selectWeaponAttachment: (categoryId, optionId) =>
    set((state) => ({
      weaponSelection: { ...state.weaponSelection, [categoryId]: optionId },
    })),

  selectEquipmentOption: (slotId, optionId) =>
    set((state) => ({
      equipmentSelection: { ...state.equipmentSelection, [slotId]: optionId },
    })),

  openOrderModal: () => set({ orderModalOpen: true }),
  closeOrderModal: () => set({ orderModalOpen: false }),
}))
