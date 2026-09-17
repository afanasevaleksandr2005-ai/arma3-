import { Router } from 'express'
import { db } from '../db.js'

export const adminOrdersRouter = Router()

interface OrderRow {
  id: number
  section: string
  price: number
  player_name: string
  discord: string
  steam_id: string
  comment: string
  selection_json: string
  created_at: string
}

adminOrdersRouter.get('/orders', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200)
  const rows = db
    .prepare('SELECT * FROM orders ORDER BY id DESC LIMIT ?')
    .all(limit) as OrderRow[]

  res.json({
    ok: true,
    orders: rows.map((row) => ({
      id: row.id,
      section: row.section,
      price: row.price,
      playerName: row.player_name,
      discord: row.discord,
      steamId: row.steam_id,
      comment: row.comment,
      selection: JSON.parse(row.selection_json) as Record<string, string>,
      createdAt: row.created_at,
    })),
  })
})
