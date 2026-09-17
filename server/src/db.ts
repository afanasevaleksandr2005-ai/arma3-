import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { env } from './env.js'

mkdirSync(dirname(env.dbPath), { recursive: true })

export const db = new Database(env.dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS weapons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    model_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS weapon_categories (
    id TEXT NOT NULL,
    weapon_id TEXT NOT NULL REFERENCES weapons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (weapon_id, id)
  );

  CREATE TABLE IF NOT EXISTS weapon_category_options (
    id TEXT NOT NULL,
    weapon_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    model_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (weapon_id, category_id, id),
    FOREIGN KEY (weapon_id, category_id) REFERENCES weapon_categories(weapon_id, id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS equipment_slots (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS equipment_slot_options (
    id TEXT NOT NULL,
    slot_id TEXT NOT NULL REFERENCES equipment_slots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    model_url TEXT,
    preview_color TEXT NOT NULL DEFAULT '#3a3a3a',
    offset_x REAL NOT NULL DEFAULT 0,
    offset_y REAL NOT NULL DEFAULT 0,
    offset_z REAL NOT NULL DEFAULT 0,
    scale REAL NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (slot_id, id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    price INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    discord TEXT NOT NULL DEFAULT '',
    steam_id TEXT NOT NULL DEFAULT '',
    comment TEXT NOT NULL DEFAULT '',
    selection_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

function settingsGet(key: string): string | undefined {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row?.value
}

function settingsSetDefault(key: string, value: string) {
  db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run(key, value)
}

settingsSetDefault('weapon_price', '500')
settingsSetDefault('equipment_price', '1000')

// Seed a starter catalog on first boot so the site isn't empty before an
// admin has added anything. Safe to run every start: it only inserts when
// the tables are empty.
function seedCatalog() {
  const weaponCount = (db.prepare('SELECT COUNT(*) AS n FROM weapons').get() as { n: number }).n
  if (weaponCount > 0) return

  const insertWeapon = db.prepare(
    `INSERT INTO weapons (id, name, subtitle, description, model_url, sort_order) VALUES (?, ?, ?, ?, NULL, ?)`,
  )
  const insertCategory = db.prepare(
    `INSERT INTO weapon_categories (id, weapon_id, name, sort_order) VALUES (?, ?, ?, ?)`,
  )
  const insertOption = db.prepare(
    `INSERT INTO weapon_category_options (id, weapon_id, category_id, name, sort_order) VALUES (?, ?, ?, ?, ?)`,
  )

  const seedWeapon = (
    weaponId: string,
    name: string,
    subtitle: string,
    categories: { id: string; name: string; options: { id: string; name: string }[] }[],
  ) => {
    insertWeapon.run(weaponId, name, subtitle, 'Базовая конфигурация', 0)
    categories.forEach((category, categoryIndex) => {
      insertCategory.run(category.id, weaponId, category.name, categoryIndex)
      category.options.forEach((option, optionIndex) => {
        insertOption.run(option.id, weaponId, category.id, option.name, optionIndex)
      })
    })
  }

  seedWeapon('ak74', 'AK-74', '5.45x39 — автомат Калашникова', [
    {
      id: 'optic',
      name: 'Оптика',
      options: [
        { id: 'none', name: 'Без прицела' },
        { id: 'kobra', name: 'Kobra' },
        { id: 'acog', name: 'ACOG 4x' },
        { id: 'pso', name: 'ПСО-1' },
      ],
    },
    {
      id: 'muzzle',
      name: 'Дульные насадки',
      options: [
        { id: 'none', name: 'Без насадки' },
        { id: 'brake', name: 'Пламегаситель' },
        { id: 'suppressor', name: 'Глушитель' },
      ],
    },
    {
      id: 'underbarrel',
      name: 'Сошки',
      options: [
        { id: 'none', name: 'Без сошек' },
        { id: 'bipod', name: 'Сошки' },
      ],
    },
    {
      id: 'magazine',
      name: 'Магазин',
      options: [
        { id: 'standard', name: 'Стандартный (30)' },
        { id: 'extended', name: 'Расширенный (45)' },
        { id: 'drum', name: 'Барабанный (75)' },
      ],
    },
  ])

  seedWeapon('m4a1', 'M4A1', '5.56x45 — карабин', [
    {
      id: 'optic',
      name: 'Оптика',
      options: [
        { id: 'none', name: 'Без прицела' },
        { id: 'holo', name: 'Холографический' },
        { id: 'acog', name: 'ACOG 4x' },
        { id: 'lpvo', name: 'LPVO 1-6x' },
      ],
    },
    {
      id: 'muzzle',
      name: 'Дульные насадки',
      options: [
        { id: 'none', name: 'Без насадки' },
        { id: 'brake', name: 'Компенсатор' },
        { id: 'suppressor', name: 'Глушитель' },
      ],
    },
    {
      id: 'underbarrel',
      name: 'Цевьё',
      options: [
        { id: 'none', name: 'Стандартное' },
        { id: 'grip', name: 'Передняя рукоять' },
        { id: 'bipod', name: 'Сошки' },
      ],
    },
    {
      id: 'magazine',
      name: 'Магазин',
      options: [
        { id: 'standard', name: 'Стандартный (30)' },
        { id: 'extended', name: 'Расширенный (40)' },
      ],
    },
  ])

  const insertSlot = db.prepare(
    `INSERT INTO equipment_slots (id, name, sort_order) VALUES (?, ?, ?)`,
  )
  const insertSlotOption = db.prepare(
    `INSERT INTO equipment_slot_options
       (id, slot_id, name, preview_color, offset_x, offset_y, offset_z, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )

  // Default anchor for each slot, in the same local space the character mannequin
  // uses (see MannequinPlaceholder). Admins can fine-tune per option in the panel
  // once a real model is uploaded — these just keep the starting position sane.
  const seedSlot = (
    slotId: string,
    name: string,
    order: number,
    anchor: { x: number; y: number; z: number },
    options: { id: string; name: string; color: string }[],
  ) => {
    insertSlot.run(slotId, name, order)
    options.forEach((option, optionIndex) => {
      insertSlotOption.run(
        option.id,
        slotId,
        option.name,
        option.color,
        anchor.x,
        anchor.y,
        anchor.z,
        optionIndex,
      )
    })
  }

  seedSlot('uniform', 'Форма', 0, { x: 0, y: 0, z: 0 }, [
    { id: 'woodland', name: 'Woodland', color: '#4b5a3a' },
    { id: 'multicam', name: 'Multicam', color: '#7a6a4f' },
    { id: 'black', name: 'Чёрная', color: '#23262b' },
    { id: 'desert', name: 'Пустынная', color: '#a68a5b' },
  ])
  seedSlot('vest', 'Бронежилет', 1, { x: 0, y: 1.24, z: 0.05 }, [
    { id: 'none', name: 'Без бронежилета', color: '#00000000' },
    { id: 'light', name: 'Лёгкий разгрузочный', color: '#3d3d3d' },
    { id: 'plate', name: 'Плитоноска', color: '#2a2a2a' },
  ])
  seedSlot('helmet', 'Каска', 2, { x: 0, y: 1.68, z: 0 }, [
    { id: 'none', name: 'Без каски', color: '#00000000' },
    { id: 'fast', name: 'FAST MT', color: '#3a3a35' },
    { id: 'kevlar', name: 'Кевларовая', color: '#2f2f2f' },
  ])
  seedSlot('backpack', 'Рюкзак', 3, { x: 0, y: 1.22, z: -0.22 }, [
    { id: 'none', name: 'Без рюкзака', color: '#00000000' },
    { id: 'assault', name: 'Штурмовой', color: '#4b4238' },
    { id: 'large', name: 'Большой', color: '#3a3530' },
  ])
  seedSlot('mask', 'Маска / очки', 4, { x: 0, y: 1.58, z: 0.13 }, [
    { id: 'none', name: 'Без маски', color: '#00000000' },
    { id: 'balaclava', name: 'Балаклава', color: '#1c1c1c' },
    { id: 'goggles', name: 'Очки', color: '#555555' },
  ])
}

seedCatalog()

export function getSetting(key: string, fallback: string): string {
  return settingsGet(key) ?? fallback
}

export function setSetting(key: string, value: string) {
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run(key, value)
}
