import bcrypt from 'bcryptjs'
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { db } from './db.js'
import { env } from './env.js'

const COOKIE_NAME = 'admin_session'
const TOKEN_TTL = '12h'

export interface AdminRow {
  id: number
  username: string
  password_hash: string
}

export function bootstrapAdmin() {
  const count = (db.prepare('SELECT COUNT(*) AS n FROM admins').get() as { n: number }).n
  if (count > 0) return

  if (!env.bootstrapAdminUsername || !env.bootstrapAdminPassword) {
    console.warn(
      '[auth] No admins exist yet and ADMIN_USERNAME/ADMIN_PASSWORD are not set — ' +
        'set them in .env and restart to create the first admin account.',
    )
    return
  }

  const hash = bcrypt.hashSync(env.bootstrapAdminPassword, 12)
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(
    env.bootstrapAdminUsername,
    hash,
  )
  console.log(`[auth] Bootstrapped first admin account "${env.bootstrapAdminUsername}"`)
}

export function verifyCredentials(username: string, password: string): AdminRow | null {
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username) as
    | AdminRow
    | undefined
  if (!admin) return null
  if (!bcrypt.compareSync(password, admin.password_hash)) return null
  return admin
}

export function issueSessionCookie(res: Response, admin: AdminRow) {
  const token = jwt.sign({ sub: admin.id, username: admin.username }, env.jwtSecret, {
    expiresIn: TOKEN_TTL,
  })
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 12 * 60 * 60 * 1000,
  })
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME)
}

interface SessionPayload {
  sub: number
  username: string
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) {
    res.status(401).json({ ok: false, error: 'Not authenticated' })
    return
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as unknown as SessionPayload
    req.admin = { id: payload.sub, username: payload.username }
    next()
  } catch {
    res.status(401).json({ ok: false, error: 'Session expired' })
  }
}

declare global {
  namespace Express {
    interface Request {
      admin?: { id: number; username: string }
    }
  }
}
