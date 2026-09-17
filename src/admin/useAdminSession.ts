import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

type SessionStatus = 'loading' | 'authed' | 'anon'

export function useAdminSession() {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [username, setUsername] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setStatus('loading')
    try {
      const res = await api.get<{ ok: true; username: string }>('/api/admin/me')
      setUsername(res.username)
      setStatus('authed')
    } catch {
      setUsername(null)
      setStatus('anon')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    await api.post('/api/admin/logout').catch(() => undefined)
    setUsername(null)
    setStatus('anon')
  }, [])

  return { status, username, refresh, logout }
}
