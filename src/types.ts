export type SectionId = 'weapon' | 'equipment'

export interface AttachmentOption {
  id: string
  name: string
  modelUrl?: string | null
}

export interface AttachmentCategory {
  id: string
  name: string
  options: AttachmentOption[]
}

export interface WeaponModel {
  id: string
  name: string
  subtitle: string
  description: string
  modelUrl?: string | null
  categories: AttachmentCategory[]
}

export interface EquipmentOption {
  id: string
  name: string
  modelUrl?: string | null
  /** Accent color used for the placeholder preview while no model is supplied. */
  previewColor: string
  /** Anchor position for the attached .glb, in the mannequin's local space. */
  offset?: { x: number; y: number; z: number }
  /** Scale multiplier applied to the attached .glb at its native export size. */
  scale?: number
}

export interface EquipmentSlot {
  id: string
  name: string
  options: EquipmentOption[]
}

export interface Prices {
  weapon: number
  equipment: number
}

export interface CatalogResponse {
  weapons: WeaponModel[]
  equipmentSlots: EquipmentSlot[]
  prices: Prices
}

export interface OrderPayload {
  section: SectionId
  price: number
  playerName: string
  discord: string
  steamId: string
  comment: string
  selection: Record<string, string>
}
