import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db.js'

export const adminAccountsRouter = Router()

adminAccountsRouter.get('/admins', (_req, res) => {
  const admins = db
    .prepare('SELECT id, username, created_at FROM admins ORDER BY created_at ASC')
    .all()
  res.json({ ok: true, admins })
})

const createAdminSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Только латиница, цифры, "-", "_", "."'),
  password: z.string().min(6).max(200),
})

adminAccountsRouter.post('/admins', (req, res) => {
  const parsed = createAdminSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Некорректные данные' })
    return
  }
  const existing = db
    .prepare('SELECT id FROM admins WHERE username = ?')
    .get(parsed.data.username)
  if (existing) {
    res.status(409).json({ ok: false, error: 'Такой логин уже занят' })
    return
  }
  const hash = bcrypt.hashSync(parsed.data.password, 12)
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(
    parsed.data.username,
    hash,
  )
  res.status(201).json({ ok: true })
})

adminAccountsRouter.delete('/admins/:id', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ ok: false, error: 'Некорректный id' })
    return
  }
  const total = (db.prepare('SELECT COUNT(*) AS n FROM admins').get() as { n: number }).n
  if (total <= 1) {
    res.status(400).json({ ok: false, error: 'Нельзя удалить последнего администратора' })
    return
  }
  if (req.admin?.id === id) {
    res.status(400).json({ ok: false, error: 'Нельзя удалить свою же учётную запись' })
    return
  }
  db.prepare('DELETE FROM admins WHERE id = ?').run(id)
  res.json({ ok: true })
})
