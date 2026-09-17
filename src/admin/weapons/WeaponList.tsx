import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, api } from '../../lib/api'
import type { WeaponModel } from '../../types'
import { AddItemForm } from '../AddItemForm'
import { ReorderButtons } from '../ReorderButtons'

export default function WeaponList() {
  const [weapons, setWeapons] = useState<WeaponModel[] | null>(null)
  const [error, setError] = useState('')

  function load() {
    api
      .get<{ ok: true; weapons: WeaponModel[] }>('/api/admin/weapons')
      .then((res) => setWeapons(res.weapons))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Не удалось загрузить'))
  }

  useEffect(load, [])

  async function handleAdd(id: string, name: string) {
    await api.post('/api/admin/weapons', { id, name, subtitle: '', description: 'Базовая конфигурация' })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить это оружие вместе со всеми категориями?')) return
    await api.delete(`/api/admin/weapons/${id}`)
    load()
  }

  async function handleMove(from: number, to: number) {
    if (!weapons) return
    const next = [...weapons]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setWeapons(next)
    await api.put('/api/admin/weapons/reorder', { order: next.map((w) => w.id) })
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Оружие</h1>
      {error && <div className="text-sm text-red-400">{error}</div>}

      {weapons && (
        <div className="flex flex-col gap-2">
          {weapons.map((weapon, index) => (
            <div
              key={weapon.id}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
            >
              <ReorderButtons index={index} length={weapons.length} onMove={handleMove} />
              <Link to={weapon.id} className="min-w-0 flex-1">
                <div className="text-sm font-medium text-neutral-100">{weapon.name}</div>
                <div className="text-xs text-neutral-500">{weapon.subtitle || weapon.id}</div>
              </Link>
              <span className="text-xs text-neutral-600">
                {weapon.categories.length} категор{weapon.categories.length === 1 ? 'ия' : 'ий'}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(weapon.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Удалить
              </button>
            </div>
          ))}
          {weapons.length === 0 && (
            <div className="text-sm text-neutral-500">Оружия пока нет — добавьте первое ниже.</div>
          )}
        </div>
      )}

      <div className="max-w-sm rounded-xl border border-white/5 p-4">
        <div className="mb-2 text-sm font-medium text-neutral-200">Добавить оружие</div>
        <AddItemForm
          placeholder="Название, например AKM"
          existingIds={weapons?.map((w) => w.id) ?? []}
          onAdd={handleAdd}
        />
      </div>
    </div>
  )
}
