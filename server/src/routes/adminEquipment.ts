import { Router } from 'express'
import { z } from 'zod'
import {
  createSlot,
  createSlotOption,
  deleteSlot,
  deleteSlotOption,
  getSlot,
  listSlots,
  reorderSlotOptions,
  reorderSlots,
  updateSlot,
  updateSlotOption,
} from '../catalogRepo.js'
import { isValidSlug } from '../slug.js'
import { publicModelUrl, uploadModel } from '../upload.js'

export const adminEquipmentRouter = Router()

const slotSchema = z.object({ name: z.string().trim().min(1).max(48) })
const HEX_COLOR = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const offsetAxis = z.number().min(-5).max(5).optional().default(0)
const optionSchema = z.object({
  name: z.string().trim().min(1).max(48),
  previewColor: z.string().regex(HEX_COLOR).optional().default('#3a3a3a'),
  offsetX: offsetAxis,
  offsetY: offsetAxis,
  offsetZ: offsetAxis,
  scale: z.number().min(0.01).max(20).optional().default(1),
})

adminEquipmentRouter.get('/equipment', (_req, res) => {
  res.json({ ok: true, slots: listSlots() })
})

adminEquipmentRouter.post('/equipment', (req, res) => {
  const idResult = z.string().min(1).max(48).safeParse(req.body?.id)
  if (!idResult.success || !isValidSlug(idResult.data)) {
    res.status(400).json({ ok: false, error: 'id должен быть slug' })
    return
  }
  const parsed = slotSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Укажите название слота' })
    return
  }
  if (getSlot(idResult.data)) {
    res.status(409).json({ ok: false, error: 'Слот с таким id уже существует' })
    return
  }
  createSlot({ id: idResult.data, name: parsed.data.name })
  res.status(201).json({ ok: true, slot: getSlot(idResult.data) })
})

adminEquipmentRouter.put('/equipment/reorder', (req, res) => {
  const parsed = z.array(z.string()).safeParse(req.body?.order)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Некорректный порядок' })
    return
  }
  reorderSlots(parsed.data)
  res.json({ ok: true })
})

adminEquipmentRouter.put('/equipment/:slotId', (req, res) => {
  if (!getSlot(req.params.slotId)) {
    res.status(404).json({ ok: false, error: 'Слот не найден' })
    return
  }
  const parsed = slotSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Укажите название слота' })
    return
  }
  updateSlot(req.params.slotId, parsed.data)
  res.json({ ok: true, slot: getSlot(req.params.slotId) })
})

adminEquipmentRouter.delete('/equipment/:slotId', (req, res) => {
  if (!getSlot(req.params.slotId)) {
    res.status(404).json({ ok: false, error: 'Слот не найден' })
    return
  }
  deleteSlot(req.params.slotId)
  res.json({ ok: true })
})

adminEquipmentRouter.post('/equipment/:slotId/options', (req, res) => {
  const slot = getSlot(req.params.slotId)
  if (!slot) {
    res.status(404).json({ ok: false, error: 'Слот не найден' })
    return
  }
  const idResult = z.string().min(1).max(48).safeParse(req.body?.id)
  if (!idResult.success || !isValidSlug(idResult.data)) {
    res.status(400).json({ ok: false, error: 'id опции должен быть slug' })
    return
  }
  const parsed = optionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Проверьте поля формы' })
    return
  }
  if (slot.options.some((o) => o.id === idResult.data)) {
    res.status(409).json({ ok: false, error: 'Опция с таким id уже есть' })
    return
  }
  createSlotOption(slot.id, {
    id: idResult.data,
    name: parsed.data.name,
    modelUrl: null,
    previewColor: parsed.data.previewColor,
    offset: { x: parsed.data.offsetX, y: parsed.data.offsetY, z: parsed.data.offsetZ },
    scale: parsed.data.scale,
  })
  res.status(201).json({ ok: true, slot: getSlot(slot.id) })
})

adminEquipmentRouter.put('/equipment/:slotId/options/reorder', (req, res) => {
  const parsed = z.array(z.string()).safeParse(req.body?.order)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Некорректный порядок' })
    return
  }
  reorderSlotOptions(req.params.slotId, parsed.data)
  res.json({ ok: true })
})

adminEquipmentRouter.put('/equipment/:slotId/options/:optionId', (req, res) => {
  const slot = getSlot(req.params.slotId)
  const existing = slot?.options.find((o) => o.id === req.params.optionId)
  if (!existing) {
    res.status(404).json({ ok: false, error: 'Опция не найдена' })
    return
  }
  const parsed = optionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Проверьте поля формы' })
    return
  }
  updateSlotOption(req.params.slotId, req.params.optionId, {
    name: parsed.data.name,
    modelUrl: existing.modelUrl,
    previewColor: parsed.data.previewColor,
    offset: { x: parsed.data.offsetX, y: parsed.data.offsetY, z: parsed.data.offsetZ },
    scale: parsed.data.scale,
  })
  res.json({ ok: true, slot: getSlot(req.params.slotId) })
})

adminEquipmentRouter.post('/equipment/:slotId/options/:optionId/model', (req, res) => {
  const slot = getSlot(req.params.slotId)
  const existing = slot?.options.find((o) => o.id === req.params.optionId)
  if (!existing) {
    res.status(404).json({ ok: false, error: 'Опция не найдена' })
    return
  }
  uploadModel(req, res, (err: unknown) => {
    if (err) {
      res.status(400).json({ ok: false, error: err instanceof Error ? err.message : 'Ошибка загрузки' })
      return
    }
    if (!req.file) {
      res.status(400).json({ ok: false, error: 'Файл не получен' })
      return
    }
    const modelUrl = publicModelUrl(req.file.filename)
    updateSlotOption(req.params.slotId, req.params.optionId, {
      name: existing.name,
      modelUrl,
      previewColor: existing.previewColor ?? '#3a3a3a',
      offset: existing.offset ?? { x: 0, y: 0, z: 0 },
      scale: existing.scale ?? 1,
    })
    res.json({ ok: true, modelUrl })
  })
})

adminEquipmentRouter.delete('/equipment/:slotId/options/:optionId', (req, res) => {
  deleteSlotOption(req.params.slotId, req.params.optionId)
  res.json({ ok: true, slot: getSlot(req.params.slotId) })
})
