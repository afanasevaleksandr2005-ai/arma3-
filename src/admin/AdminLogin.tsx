import { useState, type FormEvent } from 'react'
import { ApiError, api } from '../lib/api'

interface Props {
  onSuccess: () => void
}

export function AdminLogin({ onSuccess }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/api/admin/login', { username, password })
      onSuccess()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось войти')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0a0c12]">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-white/10 bg-[#11141c] p-6"
      >
        <div>
          <div className="text-lg font-semibold text-neutral-100">Вход для администратора</div>
          <div className="text-xs text-neutral-500">Управление оружием, экипировкой и заказами</div>
        </div>

        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          Логин
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400/60"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400/60"
          />
        </label>

        {error && <div className="text-sm text-red-400">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-amber-300 disabled:opacity-60"
        >
          {submitting ? 'Входим…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
