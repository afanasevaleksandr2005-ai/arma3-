import { useState } from 'react'
import { slugify } from '../lib/slug'

interface Props {
  placeholder: string
  existingIds: string[]
  onAdd: (id: string, name: string) => Promise<void> | void
}

export function AddItemForm({ placeholder, existingIds, onAdd }: Props) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const slug = slugify(name)
  const taken = slug.length > 0 && existingIds.includes(slug)

  async function handleAdd() {
    if (!name.trim() || !slug || taken) return
    setSubmitting(true)
    setError('')
    try {
      await onAdd(slug, name.trim())
      setName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось добавить')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm outline-none focus:border-amber-400/60"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={submitting || !name.trim() || taken}
          className="shrink-0 rounded-lg bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-400/20 disabled:opacity-40"
        >
          + Добавить
        </button>
      </div>
      {name && <div className="text-[11px] text-neutral-600">id: {slug || '—'}</div>}
      {taken && <div className="text-[11px] text-red-400">Такой id уже используется</div>}
      {error && <div className="text-[11px] text-red-400">{error}</div>}
    </div>
  )
}
