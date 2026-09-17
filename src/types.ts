export type SectionId = 'weapon' | 'equipment'

export interface AttachmentOption {
  id: string
  name: string
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
  /** Path under /public/models, e.g. "/models/weapons/ak74.glb". Left empty until real assets are supplied. */
  modelUrl?: string
  categories: AttachmentCategory[]
}

export interface EquipmentOption {
  id: string
  name: string
  /** Path under /public/models. Left empty until real assets are supplied. */
  modelUrl?: string
  /** Accent color used for the placeholder preview while no model is supplied. */
  previewColor: string
}

export interface EquipmentSlot {
  id: string
  name: string
  options: EquipmentOption[]
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
