import { db, getSetting } from './db.js'

export interface OptionDto {
  id: string
  name: string
  modelUrl: string | null
  previewColor?: string
  offset?: { x: number; y: number; z: number }
  scale?: number
}

export interface CategoryDto {
  id: string
  name: string
  options: OptionDto[]
}

export interface WeaponDto {
  id: string
  name: string
  subtitle: string
  description: string
  modelUrl: string | null
  categories: CategoryDto[]
}

export interface SlotDto {
  id: string
  name: string
  options: OptionDto[]
}

function nextSortOrder(table: string, whereSql: string, params: unknown[]): number {
  const row = db
    .prepare(`SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM ${table} ${whereSql}`)
    .get(...params) as { maxOrder: number }
  return row.maxOrder + 1
}

// ---------- Weapons ----------

export function listWeapons(): WeaponDto[] {
  const weapons = db
    .prepare('SELECT * FROM weapons ORDER BY sort_order ASC, name ASC')
    .all() as {
    id: string
    name: string
    subtitle: string
    description: string
    model_url: string | null
  }[]

  return weapons.map((weapon) => ({
    id: weapon.id,
    name: weapon.name,
    subtitle: weapon.subtitle,
    description: weapon.description,
    modelUrl: weapon.model_url,
    categories: listCategories(weapon.id),
  }))
}

export function getWeapon(weaponId: string): WeaponDto | null {
  const weapon = db.prepare('SELECT * FROM weapons WHERE id = ?').get(weaponId) as
    | { id: string; name: string; subtitle: string; description: string; model_url: string | null }
    | undefined
  if (!weapon) return null
  return {
    id: weapon.id,
    name: weapon.name,
    subtitle: weapon.subtitle,
    description: weapon.description,
    modelUrl: weapon.model_url,
    categories: listCategories(weapon.id),
  }
}

export function createWeapon(input: {
  id: string
  name: string
  subtitle: string
  description: string
  modelUrl: string | null
}) {
  const order = nextSortOrder('weapons', '', [])
  db.prepare(
    `INSERT INTO weapons (id, name, subtitle, description, model_url, sort_order, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
  ).run(input.id, input.name, input.subtitle, input.description, input.modelUrl, order)
}

export function updateWeapon(
  weaponId: string,
  input: { name: string; subtitle: string; description: string; modelUrl: string | null },
) {
  db.prepare(
    `UPDATE weapons SET name = ?, subtitle = ?, description = ?, model_url = ?, updated_at = datetime('now')
     WHERE id = ?`,
  ).run(input.name, input.subtitle, input.description, input.modelUrl, weaponId)
}

export function deleteWeapon(weaponId: string) {
  db.prepare('DELETE FROM weapons WHERE id = ?').run(weaponId)
}

// ---------- Weapon categories ----------

function listCategories(weaponId: string): CategoryDto[] {
  const categories = db
    .prepare('SELECT * FROM weapon_categories WHERE weapon_id = ? ORDER BY sort_order ASC')
    .all(weaponId) as { id: string; name: string }[]

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    options: listCategoryOptions(weaponId, category.id),
  }))
}

export function createWeaponCategory(weaponId: string, input: { id: string; name: string }) {
  const order = nextSortOrder('weapon_categories', 'WHERE weapon_id = ?', [weaponId])
  db.prepare(
    'INSERT INTO weapon_categories (id, weapon_id, name, sort_order) VALUES (?, ?, ?, ?)',
  ).run(input.id, weaponId, input.name, order)
}

export function updateWeaponCategory(
  weaponId: string,
  categoryId: string,
  input: { name: string },
) {
  db.prepare('UPDATE weapon_categories SET name = ? WHERE weapon_id = ? AND id = ?').run(
    input.name,
    weaponId,
    categoryId,
  )
}

export function deleteWeaponCategory(weaponId: string, categoryId: string) {
  db.prepare('DELETE FROM weapon_categories WHERE weapon_id = ? AND id = ?').run(
    weaponId,
    categoryId,
  )
}

// ---------- Weapon category options ----------

function listCategoryOptions(weaponId: string, categoryId: string): OptionDto[] {
  const options = db
    .prepare(
      'SELECT * FROM weapon_category_options WHERE weapon_id = ? AND category_id = ? ORDER BY sort_order ASC',
    )
    .all(weaponId, categoryId) as { id: string; name: string; model_url: string | null }[]

  return options.map((option) => ({ id: option.id, name: option.name, modelUrl: option.model_url }))
}

export function createWeaponOption(
  weaponId: string,
  categoryId: string,
  input: { id: string; name: string; modelUrl: string | null },
) {
  const order = nextSortOrder('weapon_category_options', 'WHERE weapon_id = ? AND category_id = ?', [
    weaponId,
    categoryId,
  ])
  db.prepare(
    `INSERT INTO weapon_category_options (id, weapon_id, category_id, name, model_url, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(input.id, weaponId, categoryId, input.name, input.modelUrl, order)
}

export function updateWeaponOption(
  weaponId: string,
  categoryId: string,
  optionId: string,
  input: { name: string; modelUrl: string | null },
) {
  db.prepare(
    `UPDATE weapon_category_options SET name = ?, model_url = ?
     WHERE weapon_id = ? AND category_id = ? AND id = ?`,
  ).run(input.name, input.modelUrl, weaponId, categoryId, optionId)
}

export function deleteWeaponOption(weaponId: string, categoryId: string, optionId: string) {
  db.prepare(
    'DELETE FROM weapon_category_options WHERE weapon_id = ? AND category_id = ? AND id = ?',
  ).run(weaponId, categoryId, optionId)
}

// ---------- Equipment slots ----------

export function listSlots(): SlotDto[] {
  const slots = db.prepare('SELECT * FROM equipment_slots ORDER BY sort_order ASC').all() as {
    id: string
    name: string
  }[]
  return slots.map((slot) => ({ id: slot.id, name: slot.name, options: listSlotOptions(slot.id) }))
}

export function getSlot(slotId: string): SlotDto | null {
  const slot = db.prepare('SELECT * FROM equipment_slots WHERE id = ?').get(slotId) as
    | { id: string; name: string }
    | undefined
  if (!slot) return null
  return { id: slot.id, name: slot.name, options: listSlotOptions(slot.id) }
}

export function createSlot(input: { id: string; name: string }) {
  const order = nextSortOrder('equipment_slots', '', [])
  db.prepare('INSERT INTO equipment_slots (id, name, sort_order) VALUES (?, ?, ?)').run(
    input.id,
    input.name,
    order,
  )
}

export function updateSlot(slotId: string, input: { name: string }) {
  db.prepare('UPDATE equipment_slots SET name = ? WHERE id = ?').run(input.name, slotId)
}

export function deleteSlot(slotId: string) {
  db.prepare('DELETE FROM equipment_slots WHERE id = ?').run(slotId)
}

// ---------- Equipment slot options ----------

interface SlotOptionRow {
  id: string
  name: string
  model_url: string | null
  preview_color: string
  offset_x: number
  offset_y: number
  offset_z: number
  scale: number
}

function listSlotOptions(slotId: string): OptionDto[] {
  const options = db
    .prepare('SELECT * FROM equipment_slot_options WHERE slot_id = ? ORDER BY sort_order ASC')
    .all(slotId) as SlotOptionRow[]
  return options.map((option) => ({
    id: option.id,
    name: option.name,
    modelUrl: option.model_url,
    previewColor: option.preview_color,
    offset: { x: option.offset_x, y: option.offset_y, z: option.offset_z },
    scale: option.scale,
  }))
}

export interface SlotOptionInput {
  name: string
  modelUrl: string | null
  previewColor: string
  offset: { x: number; y: number; z: number }
  scale: number
}

export function createSlotOption(slotId: string, input: SlotOptionInput & { id: string }) {
  const order = nextSortOrder('equipment_slot_options', 'WHERE slot_id = ?', [slotId])
  db.prepare(
    `INSERT INTO equipment_slot_options
       (id, slot_id, name, model_url, preview_color, offset_x, offset_y, offset_z, scale, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    input.id,
    slotId,
    input.name,
    input.modelUrl,
    input.previewColor,
    input.offset.x,
    input.offset.y,
    input.offset.z,
    input.scale,
    order,
  )
}

export function updateSlotOption(slotId: string, optionId: string, input: SlotOptionInput) {
  db.prepare(
    `UPDATE equipment_slot_options
     SET name = ?, model_url = ?, preview_color = ?, offset_x = ?, offset_y = ?, offset_z = ?, scale = ?
     WHERE slot_id = ? AND id = ?`,
  ).run(
    input.name,
    input.modelUrl,
    input.previewColor,
    input.offset.x,
    input.offset.y,
    input.offset.z,
    input.scale,
    slotId,
    optionId,
  )
}

export function deleteSlotOption(slotId: string, optionId: string) {
  db.prepare('DELETE FROM equipment_slot_options WHERE slot_id = ? AND id = ?').run(
    slotId,
    optionId,
  )
}

// ---------- Reordering (drag-free: admin UI sends the full id order) ----------

export function reorderWeapons(order: string[]) {
  const stmt = db.prepare('UPDATE weapons SET sort_order = ? WHERE id = ?')
  const tx = db.transaction((ids: string[]) => {
    ids.forEach((id, index) => stmt.run(index, id))
  })
  tx(order)
}

export function reorderWeaponCategories(weaponId: string, order: string[]) {
  const stmt = db.prepare('UPDATE weapon_categories SET sort_order = ? WHERE weapon_id = ? AND id = ?')
  const tx = db.transaction((ids: string[]) => {
    ids.forEach((id, index) => stmt.run(index, weaponId, id))
  })
  tx(order)
}

export function reorderWeaponOptions(weaponId: string, categoryId: string, order: string[]) {
  const stmt = db.prepare(
    'UPDATE weapon_category_options SET sort_order = ? WHERE weapon_id = ? AND category_id = ? AND id = ?',
  )
  const tx = db.transaction((ids: string[]) => {
    ids.forEach((id, index) => stmt.run(index, weaponId, categoryId, id))
  })
  tx(order)
}

export function reorderSlots(order: string[]) {
  const stmt = db.prepare('UPDATE equipment_slots SET sort_order = ? WHERE id = ?')
  const tx = db.transaction((ids: string[]) => {
    ids.forEach((id, index) => stmt.run(index, id))
  })
  tx(order)
}

export function reorderSlotOptions(slotId: string, order: string[]) {
  const stmt = db.prepare('UPDATE equipment_slot_options SET sort_order = ? WHERE slot_id = ? AND id = ?')
  const tx = db.transaction((ids: string[]) => {
    ids.forEach((id, index) => stmt.run(index, slotId, id))
  })
  tx(order)
}

// ---------- Public catalog + prices ----------

export function getPrices() {
  return {
    weapon: Number(getSetting('weapon_price', '500')),
    equipment: Number(getSetting('equipment_price', '1000')),
  }
}

export function getPublicCatalog() {
  return {
    weapons: listWeapons(),
    equipmentSlots: listSlots(),
    prices: getPrices(),
  }
}
