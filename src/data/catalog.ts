import type { EquipmentSlot, WeaponModel } from '../types'

export const WEAPON_SECTION_PRICE = 500
export const EQUIPMENT_SECTION_PRICE = 1000

export const WEAPONS: WeaponModel[] = [
  {
    id: 'ak74',
    name: 'AK-74',
    subtitle: '5.45x39 — автомат Калашникова',
    description: 'Базовая конфигурация',
    categories: [
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
    ],
  },
  {
    id: 'm4a1',
    name: 'M4A1',
    subtitle: '5.56x45 — карабин',
    description: 'Базовая конфигурация',
    categories: [
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
    ],
  },
]

export const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  {
    id: 'uniform',
    name: 'Форма',
    options: [
      { id: 'woodland', name: 'Woodland', previewColor: '#4b5a3a' },
      { id: 'multicam', name: 'Multicam', previewColor: '#7a6a4f' },
      { id: 'black', name: 'Чёрная', previewColor: '#23262b' },
      { id: 'desert', name: 'Пустынная', previewColor: '#a68a5b' },
    ],
  },
  {
    id: 'vest',
    name: 'Бронежилет',
    options: [
      { id: 'none', name: 'Без бронежилета', previewColor: '#00000000' },
      { id: 'light', name: 'Лёгкий разгрузочный', previewColor: '#3d3d3d' },
      { id: 'plate', name: 'Плитоноска', previewColor: '#2a2a2a' },
    ],
  },
  {
    id: 'helmet',
    name: 'Каска',
    options: [
      { id: 'none', name: 'Без каски', previewColor: '#00000000' },
      { id: 'fast', name: 'FAST MT', previewColor: '#3a3a35' },
      { id: 'kevlar', name: 'Кевларовая', previewColor: '#2f2f2f' },
    ],
  },
  {
    id: 'backpack',
    name: 'Рюкзак',
    options: [
      { id: 'none', name: 'Без рюкзака', previewColor: '#00000000' },
      { id: 'assault', name: 'Штурмовой', previewColor: '#4b4238' },
      { id: 'large', name: 'Большой', previewColor: '#3a3530' },
    ],
  },
  {
    id: 'mask',
    name: 'Маска / очки',
    options: [
      { id: 'none', name: 'Без маски', previewColor: '#00000000' },
      { id: 'balaclava', name: 'Балаклава', previewColor: '#1c1c1c' },
      { id: 'goggles', name: 'Очки', previewColor: '#555555' },
    ],
  },
]
