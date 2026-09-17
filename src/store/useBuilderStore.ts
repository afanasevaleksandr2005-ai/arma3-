import { create } from 'zustand'
import { api } from '../lib/api'
import type { CatalogResponse, EquipmentSlot, Prices, SectionId, WeaponModel } from '../types'

function defaultWeaponSelection(weapon: WeaponModel | undefined): Record<string, string> {
  if (!weapon) return {}
  return Object.fromEntries(
    weapon.categories.map((category) => [category.id, category.options[0]?.id ?? '']),
  )
}

function defaultEquipmentSelection(slots: EquipmentSlot[]): Record<string, string> {
  return Object.fromEntries(slots.map((slot) => [slot.id, slot.options[0]?.id ?? '']))
}

type CatalogStatus = 'idle' | 'loading' | 'ready' | 'error'

interface BuilderState {
  activeSection: SectionId
  weapons: WeaponModel[]
  equipmentSlots: EquipmentSlot[]
  prices: Prices
  catalogStatus: CatalogStatus
  catalogError: string | null

  selectedWeaponId: string
  weaponSelection: Record<string, string>
  equipmentSelection: Record<string, string>
  orderModalOpen: boolean

  loadCatalog: () => Promise<void>
  setActiveSection: (section: SectionId) => void
  selectWeapon: (weaponId: string) => void
  selectWeaponAttachment: (categoryId: string, optionId: string) => void
  selectEquipmentOption: (slotId: string, optionId: string) => void
  openOrderModal: () => void
  closeOrderModal: () => void
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  activeSection: 'weapon',
  weapons: [],
  equipmentSlots: [],
  prices: { weapon: 500, equipment: 1000 },
  catalogStatus: 'idle',
  catalogError: null,

  selectedWeaponId: '',
  weaponSelection: {},
  equipmentSelection: {},
  orderModalOpen: false,

  loadCatalog: async () => {
    set({ catalogStatus: 'loading', catalogError: null })
    try {
      const catalog = await api.get<CatalogResponse>('/api/catalog')
      const firstWeapon = catalog.weapons[0]
      set({
        weapons: catalog.weapons,
        equipmentSlots: catalog.equipmentSlots,
        prices: catalog.prices,
        catalogStatus: 'ready',
        selectedWeaponId: firstWeapon?.id ?? '',
        weaponSelection: defaultWeaponSelection(firstWeapon),
        equipmentSelection: defaultEquipmentSelection(catalog.equipmentSlots),
      })
    } catch (error) {
      set({
        catalogStatus: 'error',
        catalogError: error instanceof Error ? error.message : 'Не удалось загрузить каталог',
      })
    }
  },

  setActiveSection: (section) => set({ activeSection: section }),

  selectWeapon: (weaponId) => {
    const weapon = get().weapons.find((item) => item.id === weaponId)
    set({ selectedWeaponId: weaponId, weaponSelection: defaultWeaponSelection(weapon) })
  },

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
