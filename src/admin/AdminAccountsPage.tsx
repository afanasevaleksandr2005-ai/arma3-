import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, api } from '../lib/api'

interface AdminRow {
  id: number
  username: string
  created_at: string
}

export default function AdminAccountsPage() {
  const [admins, setAdmins] = useState<AdminRow[] | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function load() {
    api.get<{ ok: true; admins: AdminRow[] }>('/api/admin/admins').then((res) => setAdmins(res.admins))
  }

  useEffect(load, [])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/api/admin/admins', { username, password })
      setUsername('')
      setPassword('')
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось создать администратора')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить этого администратора?')) return
    try {
      await api.delete(`/api/admin/admins/${id}`)
      load()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Не удалось удалить')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Администраторы</h1>

      {admins && (
        <div className="flex flex-col gap-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm"
            >
              <span>{admin.username}</span>
              <button
                type="button"
                onClick={() => handleDelete(admin.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex max-w-sm flex-col gap-3 rounded-xl border border-white/5 p-4">
        <div className="text-sm font-medium text-neutral-200">Добавить администратора</div>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Логин"
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-amber-400/60"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль (мин. 6 символов)"
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-amber-400/60"
        />
        {error && <div className="text-sm text-red-400">{error}</div>}
        <button
          type="submit"
          disabled={submitting}
          className="w-fit rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-amber-300 disabled:opacity-60"
        >
          {submitting ? 'Создание…' : 'Создать'}
        </button>
      </form>
    </div>
  )
}
