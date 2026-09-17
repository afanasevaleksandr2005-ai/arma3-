import { useEffect, useState } from 'react'
import { ApiError, api } from '../lib/api'
import type { Prices } from '../types'

export default function AdminSettingsPage() {
  const [prices, setPrices] = useState<Prices | null>(null)
  const [weaponInput, setWeaponInput] = useState('')
  const [equipmentInput, setEquipmentInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<{ ok: true; prices: Prices }>('/api/admin/settings/prices').then((res) => {
      setPrices(res.prices)
      setWeaponInput(String(res.prices.weapon))
      setEquipmentInput(String(res.prices.equipment))
    })
  }, [])

  async function handleSave() {
    setStatus('saving')
    setError('')
    try {
      const res = await api.put<{ ok: true; prices: Prices }>('/api/admin/settings/prices', {
        weapon: Number(weaponInput),
        equipment: Number(equipmentInput),
      })
      setPrices(res.prices)
      setStatus('saved')
    } catch (err) {
      setStatus('error')
      setError(err instanceof ApiError ? err.message : 'Не удалось сохранить')
    }
  }

  if (!prices) return <div className="text-sm text-neutral-500">Загрузка…</div>

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <h1 className="text-lg font-semibold">Настройки цен</h1>
      <p className="text-sm text-neutral-500">
        Цена фиксирована за раздел и не зависит от выбранных опций внутри него.
      </p>

      <label className="flex flex-col gap-1 text-sm text-neutral-300">
        Цена за оружие, ₽
        <input
          type="number"
          min={0}
          value={weaponInput}
          onChange={(e) => setWeaponInput(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400/60"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-neutral-300">
        Цена за экипировку, ₽
        <input
          type="number"
          min={0}
          value={equipmentInput}
          onChange={(e) => setEquipmentInput(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400/60"
        />
      </label>

      {status === 'error' && <div className="text-sm text-red-400">{error}</div>}
      {status === 'saved' && <div className="text-sm text-emerald-400">Сохранено</div>}

      <button
        type="button"
        onClick={handleSave}
        disabled={status === 'saving'}
        className="w-fit rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-amber-300 disabled:opacity-60"
      >
        {status === 'saving' ? 'Сохранение…' : 'Сохранить'}
      </button>
    </div>
  )
}
