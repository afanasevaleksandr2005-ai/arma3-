import { Router } from 'express'
import { z } from 'zod'
import { setSetting } from '../db.js'
import { getPrices } from '../catalogRepo.js'

export const adminSettingsRouter = Router()

adminSettingsRouter.get('/settings/prices', (_req, res) => {
  res.json({ ok: true, prices: getPrices() })
})

const pricesSchema = z.object({
  weapon: z.number().int().min(0).max(1_000_000),
  equipment: z.number().int().min(0).max(1_000_000),
})

adminSettingsRouter.put('/settings/prices', (req, res) => {
  const parsed = pricesSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Укажите корректные цены' })
    return
  }
  setSetting('weapon_price', String(parsed.data.weapon))
  setSetting('equipment_price', String(parsed.data.equipment))
  res.json({ ok: true, prices: getPrices() })
})
