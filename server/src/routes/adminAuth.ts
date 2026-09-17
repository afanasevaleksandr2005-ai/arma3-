import { Router } from 'express'
import { z } from 'zod'
import { clearSessionCookie, issueSessionCookie, requireAdmin, verifyCredentials } from '../auth.js'

const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(200),
})

export const adminAuthRouter = Router()

adminAuthRouter.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Введите логин и пароль' })
    return
  }
  const admin = verifyCredentials(parsed.data.username, parsed.data.password)
  if (!admin) {
    res.status(401).json({ ok: false, error: 'Неверный логин или пароль' })
    return
  }
  issueSessionCookie(res, admin)
  res.json({ ok: true, username: admin.username })
})

adminAuthRouter.post('/logout', (_req, res) => {
  clearSessionCookie(res)
  res.json({ ok: true })
})

adminAuthRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ ok: true, username: req.admin?.username })
})
