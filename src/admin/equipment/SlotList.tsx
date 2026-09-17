import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, api } from '../../lib/api'
import type { EquipmentSlot } from '../../types'
import { AddItemForm } from '../AddItemForm'
import { ReorderButtons } from '../ReorderButtons'

export default function SlotList() {
  const [slots, setSlots] = useState<EquipmentSlot[] | null>(null)
  const [error, setError] = useState('')

  function load() {
    api
      .get<{ ok: true; slots: EquipmentSlot[] }>('/api/admin/equipment')
      .then((res) => setSlots(res.slots))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Не удалось загрузить'))
  }

  useEffect(load, [])

  async function handleAdd(id: string, name: string) {
    await api.post('/api/admin/equipment', { id, name })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить этот слот экипировки вместе со всеми опциями?')) return
    await api.delete(`/api/admin/equipment/${id}`)
    load()
  }

  async function handleMove(from: number, to: number) {
    if (!slots) return
    const next = [...slots]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setSlots(next)
    await api.put('/api/admin/equipment/reorder', { order: next.map((s) => s.id) })
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Экипировка</h1>
      <p className="max-w-2xl text-sm text-neutral-500">
        Слоты «uniform», «vest», «helmet», «backpack», «mask» — те, что показываются на 3D-персонаже.
        Новые слоты можно добавлять, но у них пока нет своей точки крепления на модели — они попадут
        в заказ как обычный выбор, без визуального отображения.
      </p>
      {error && <div className="text-sm text-red-400">{error}</div>}

      {slots && (
        <div className="flex flex-col gap-2">
          {slots.map((slot, index) => (
            <div
              key={slot.id}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
            >
              <ReorderButtons index={index} length={slots.length} onMove={handleMove} />
              <Link to={slot.id} className="min-w-0 flex-1">
                <div className="text-sm font-medium text-neutral-100">{slot.name}</div>
                <div className="text-xs text-neutral-500">{slot.id}</div>
              </Link>
              <span className="text-xs text-neutral-600">{slot.options.length} опций</span>
              <button
                type="button"
                onClick={() => handleDelete(slot.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-sm rounded-xl border border-white/5 p-4">
        <div className="mb-2 text-sm font-medium text-neutral-200">Добавить слот</div>
        <AddItemForm
          placeholder="Например: Перчатки"
          existingIds={slots?.map((s) => s.id) ?? []}
          onAdd={handleAdd}
        />
      </div>
    </div>
  )
}
