import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EquipmentScene } from '../../components/EquipmentScene'
import { ModelStage } from '../../components/ModelStage'
import { ApiError, api } from '../../lib/api'
import type { EquipmentOption, EquipmentSlot } from '../../types'
import { AddItemForm } from '../AddItemForm'
import { ModelUploadField } from '../ModelUploadField'
import { ReorderButtons } from '../ReorderButtons'

export default function SlotEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [slots, setSlots] = useState<EquipmentSlot[] | null>(null)
  const [error, setError] = useState('')
  const [previewOptionId, setPreviewOptionId] = useState<string>('')

  function load() {
    api
      .get<{ ok: true; slots: EquipmentSlot[] }>('/api/admin/equipment')
      .then((res) => {
        setSlots(res.slots)
        if (!res.slots.some((s) => s.id === id)) setError('Слот не найден')
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Не удалось загрузить'))
  }

  useEffect(() => {
    setPreviewOptionId('')
    load()
    // eslint/oxlint: intentionally reload only when the route param changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const slot = slots?.find((s) => s.id === id)

  useEffect(() => {
    if (!previewOptionId && slot) setPreviewOptionId(slot.options[0]?.id ?? '')
  }, [slot, previewOptionId])

  const previewSelection = useMemo(() => {
    if (!slots) return {}
    const selection: Record<string, string> = {}
    for (const s of slots) {
      selection[s.id] = s.id === id ? previewOptionId : (s.options[0]?.id ?? '')
    }
    return selection
  }, [slots, id, previewOptionId])

  if (error) return <div className="text-sm text-red-400">{error}</div>
  if (!slots || !slot) return <div className="text-sm text-neutral-500">Загрузка…</div>

  async function handleDeleteSlot() {
    if (!confirm(`Удалить слот «${slot!.name}»?`)) return
    await api.delete(`/api/admin/equipment/${slot!.id}`)
    navigate('/admin/equipment')
  }

  async function handleAddOption(optionId: string, optionName: string) {
    await api.post(`/api/admin/equipment/${slot!.id}/options`, { id: optionId, name: optionName })
    load()
  }

  async function handleDeleteOption(optionId: string) {
    await api.delete(`/api/admin/equipment/${slot!.id}/options/${optionId}`)
    load()
  }

  async function handleMoveOption(from: number, to: number) {
    const ids = slot!.options.map((o) => o.id)
    const [moved] = ids.splice(from, 1)
    ids.splice(to, 0, moved)
    await api.put(`/api/admin/equipment/${slot!.id}/options/reorder`, { order: ids })
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{slot.name}</h1>
        <button type="button" onClick={handleDeleteSlot} className="text-xs text-red-400 hover:text-red-300">
          Удалить слот
        </button>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6">
        <div className="flex flex-col gap-3">
          {slot.options.map((option, index) => (
            <OptionEditor
              key={option.id}
              slotId={slot.id}
              option={option}
              index={index}
              total={slot.options.length}
              onMove={handleMoveOption}
              onDelete={() => handleDeleteOption(option.id)}
              onChanged={load}
              onPreview={() => setPreviewOptionId(option.id)}
              isPreviewed={previewOptionId === option.id}
            />
          ))}

          <div className="rounded-xl border border-white/5 p-4">
            <div className="mb-2 text-sm font-medium text-neutral-200">Добавить опцию</div>
            <AddItemForm
              placeholder="Например: Мультикам"
              existingIds={slot.options.map((o) => o.id)}
              onAdd={handleAddOption}
            />
          </div>
        </div>

        <div className="h-[420px] overflow-hidden rounded-xl border border-white/5 bg-white/[0.015]">
          <ModelStage
            cameraDistance={3.4}
            cameraTarget={[0, 0.35, 0]}
            placeholder={<EquipmentScene slots={slots} selection={previewSelection} />}
          />
        </div>
      </div>
    </div>
  )
}

function OptionEditor({
  slotId,
  option,
  index,
  total,
  onMove,
  onDelete,
  onChanged,
  onPreview,
  isPreviewed,
}: {
  slotId: string
  option: EquipmentOption
  index: number
  total: number
  onMove: (from: number, to: number) => void
  onDelete: () => void
  onChanged: () => void
  onPreview: () => void
  isPreviewed: boolean
}) {
  const [name, setName] = useState(option.name)
  const [color, setColor] = useState(option.previewColor)
  const [offsetX, setOffsetX] = useState(option.offset?.x ?? 0)
  const [offsetY, setOffsetY] = useState(option.offset?.y ?? 0)
  const [offsetZ, setOffsetZ] = useState(option.offset?.z ?? 0)
  const [scale, setScale] = useState(option.scale ?? 1)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  async function save() {
    setStatus('saving')
    await api.put(`/api/admin/equipment/${slotId}/options/${option.id}`, {
      name,
      previewColor: color,
      offsetX,
      offsetY,
      offsetZ,
      scale,
    })
    setStatus('saved')
    onChanged()
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        isPreviewed ? 'border-amber-400/40 bg-amber-400/[0.03]' : 'border-white/5'
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <ReorderButtons index={index} length={total} onMove={onMove} />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={save}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-medium outline-none focus:border-amber-400/60"
        />
        <button
          type="button"
          onClick={onPreview}
          className={`text-xs ${isPreviewed ? 'text-amber-300' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          {isPreviewed ? 'Показано' : 'Показать'}
        </button>
        <button type="button" onClick={onDelete} className="text-xs text-red-400 hover:text-red-300">
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 pl-1 sm:grid-cols-5">
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Цвет заглушки
          <input
            type="color"
            value={color.length === 9 ? color.slice(0, 7) : color}
            onChange={(e) => setColor(e.target.value)}
            onBlur={save}
            className="h-8 w-full rounded border border-white/10 bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          X
          <input
            type="number"
            step={0.01}
            value={offsetX}
            onChange={(e) => setOffsetX(Number(e.target.value))}
            onBlur={save}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Y
          <input
            type="number"
            step={0.01}
            value={offsetY}
            onChange={(e) => setOffsetY(Number(e.target.value))}
            onBlur={save}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Z
          <input
            type="number"
            step={0.01}
            value={offsetZ}
            onChange={(e) => setOffsetZ(Number(e.target.value))}
            onBlur={save}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Масштаб
          <input
            type="number"
            step={0.01}
            min={0.01}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            onBlur={save}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-sm outline-none focus:border-amber-400/60"
          />
        </label>
      </div>

      <div className="mt-3 pl-1">
        <ModelUploadField
          currentUrl={option.modelUrl}
          uploadPath={`/api/admin/equipment/${slotId}/options/${option.id}/model`}
          onUploaded={onChanged}
        />
      </div>
      {status === 'saving' && <div className="mt-1 pl-1 text-[11px] text-neutral-600">Сохранение…</div>}
    </div>
  )
}
