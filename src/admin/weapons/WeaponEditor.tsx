import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ModelStage } from '../../components/ModelStage'
import { WeaponPlaceholder } from '../../components/WeaponPlaceholder'
import { ApiError, api } from '../../lib/api'
import type { WeaponModel } from '../../types'
import { AddItemForm } from '../AddItemForm'
import { ModelUploadField } from '../ModelUploadField'
import { ReorderButtons } from '../ReorderButtons'

function useWeapon(weaponId: string | undefined) {
  const [weapon, setWeapon] = useState<WeaponModel | null>(null)
  const [error, setError] = useState('')

  function load() {
    api
      .get<{ ok: true; weapons: WeaponModel[] }>('/api/admin/weapons')
      .then((res) => {
        const found = res.weapons.find((w) => w.id === weaponId) ?? null
        setWeapon(found)
        if (!found) setError('Оружие не найдено')
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Не удалось загрузить'))
  }

  useEffect(load, [weaponId])
  return { weapon, error, reload: load }
}

export default function WeaponEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { weapon, error, reload } = useWeapon(id)

  const [name, setName] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    if (weapon) {
      setName(weapon.name)
      setSubtitle(weapon.subtitle)
      setDescription(weapon.description)
    }
  }, [weapon])

  if (error) return <div className="text-sm text-red-400">{error}</div>
  if (!weapon) return <div className="text-sm text-neutral-500">Загрузка…</div>

  async function handleSave() {
    setSaveStatus('saving')
    await api.put(`/api/admin/weapons/${weapon!.id}`, { name, subtitle, description })
    setSaveStatus('saved')
    reload()
  }

  async function handleDelete() {
    if (!confirm('Удалить это оружие?')) return
    await api.delete(`/api/admin/weapons/${weapon!.id}`)
    navigate('/admin/weapons')
  }

  async function handleAddCategory(categoryId: string, categoryName: string) {
    await api.post(`/api/admin/weapons/${weapon!.id}/categories`, { id: categoryId, name: categoryName })
    reload()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{weapon.name}</h1>
        <button type="button" onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300">
          Удалить оружие
        </button>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-white/5 p-4">
            <div className="mb-3 text-sm font-medium text-neutral-200">Основное</div>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm text-neutral-300">
                Название
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-amber-400/60"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-neutral-300">
                Подпись (калибр/класс)
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-amber-400/60"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-neutral-300">
                Описание
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-amber-400/60"
                />
              </label>
              <button
                type="button"
                onClick={handleSave}
                className="w-fit rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-amber-300"
              >
                {saveStatus === 'saving' ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 p-4">
            <div className="mb-3 text-sm font-medium text-neutral-200">3D-модель (.glb/.gltf)</div>
            <ModelUploadField
              currentUrl={weapon.modelUrl}
              uploadPath={`/api/admin/weapons/${weapon.id}/model`}
              onUploaded={reload}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-sm font-medium text-neutral-200">Категории сборки</div>
            {weapon.categories.map((category, index) => (
              <CategoryBlock
                key={category.id}
                weaponId={weapon.id}
                category={category}
                index={index}
                total={weapon.categories.length}
                existingCategoryIds={weapon.categories.map((c) => c.id)}
                onChanged={reload}
              />
            ))}
            <div className="rounded-xl border border-white/5 p-4">
              <div className="mb-2 text-sm font-medium text-neutral-200">Добавить категорию</div>
              <AddItemForm
                placeholder="Например: Оптика"
                existingIds={weapon.categories.map((c) => c.id)}
                onAdd={handleAddCategory}
              />
            </div>
          </div>
        </div>

        <div className="h-[420px] overflow-hidden rounded-xl border border-white/5 bg-white/[0.015]">
          <ModelStage
            modelUrl={weapon.modelUrl ?? undefined}
            placeholder={
              <WeaponPlaceholder
                weaponId={weapon.id}
                optic={weapon.categories.find((c) => c.id === 'optic')?.options[0]?.id ?? 'none'}
                muzzle="none"
                underbarrel="none"
                magazine="standard"
              />
            }
          />
        </div>
      </div>
    </div>
  )
}

function CategoryBlock({
  weaponId,
  category,
  index,
  total,
  existingCategoryIds,
  onChanged,
}: {
  weaponId: string
  category: WeaponModel['categories'][number]
  index: number
  total: number
  existingCategoryIds: string[]
  onChanged: () => void
}) {
  const [name, setName] = useState(category.name)

  async function saveName() {
    if (name.trim() && name !== category.name) {
      await api.put(`/api/admin/weapons/${weaponId}/categories/${category.id}`, { name: name.trim() })
      onChanged()
    }
  }

  async function handleDeleteCategory() {
    if (!confirm(`Удалить категорию «${category.name}»?`)) return
    await api.delete(`/api/admin/weapons/${weaponId}/categories/${category.id}`)
    onChanged()
  }

  async function handleAddOption(optionId: string, optionName: string) {
    await api.post(`/api/admin/weapons/${weaponId}/categories/${category.id}/options`, {
      id: optionId,
      name: optionName,
    })
    onChanged()
  }

  async function handleDeleteOption(optionId: string) {
    await api.delete(`/api/admin/weapons/${weaponId}/categories/${category.id}/options/${optionId}`)
    onChanged()
  }

  async function handleMoveOption(from: number, to: number) {
    const ids = category.options.map((o) => o.id)
    const [moved] = ids.splice(from, 1)
    ids.splice(to, 0, moved)
    await api.put(`/api/admin/weapons/${weaponId}/categories/${category.id}/options/reorder`, {
      order: ids,
    })
    onChanged()
  }

  return (
    <div className="rounded-xl border border-white/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <ReorderButtons
          index={index}
          length={total}
          onMove={(from, to) => {
            const ids = existingCategoryIds.slice()
            const [moved] = ids.splice(from, 1)
            ids.splice(to, 0, moved)
            api.put(`/api/admin/weapons/${weaponId}/categories/reorder`, { order: ids }).then(onChanged)
          }}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-medium outline-none focus:border-amber-400/60"
        />
        <button type="button" onClick={handleDeleteCategory} className="text-xs text-red-400 hover:text-red-300">
          Удалить категорию
        </button>
      </div>

      <div className="flex flex-col gap-1.5 pl-1">
        {category.options.map((option, optionIndex) => (
          <div key={option.id} className="flex items-center gap-2">
            <ReorderButtons index={optionIndex} length={category.options.length} onMove={handleMoveOption} />
            <OptionNameField
              weaponId={weaponId}
              categoryId={category.id}
              option={option}
              onChanged={onChanged}
            />
            <button
              type="button"
              onClick={() => handleDeleteOption(option.id)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <AddItemForm
          placeholder="Название опции"
          existingIds={category.options.map((o) => o.id)}
          onAdd={handleAddOption}
        />
      </div>
    </div>
  )
}

function OptionNameField({
  weaponId,
  categoryId,
  option,
  onChanged,
}: {
  weaponId: string
  categoryId: string
  option: { id: string; name: string }
  onChanged: () => void
}) {
  const [name, setName] = useState(option.name)

  async function saveName() {
    if (name.trim() && name !== option.name) {
      await api.put(`/api/admin/weapons/${weaponId}/categories/${categoryId}/options/${option.id}`, {
        name: name.trim(),
      })
      onChanged()
    }
  }

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      onBlur={saveName}
      className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1 text-sm outline-none focus:border-amber-400/60"
    />
  )
}
