import { Router } from 'express'
import { z } from 'zod'
import {
  createWeapon,
  createWeaponCategory,
  createWeaponOption,
  deleteWeapon,
  deleteWeaponCategory,
  deleteWeaponOption,
  getWeapon,
  listWeapons,
  reorderWeaponCategories,
  reorderWeaponOptions,
  reorderWeapons,
  updateWeapon,
  updateWeaponCategory,
  updateWeaponOption,
} from '../catalogRepo.js'
import { isValidSlug } from '../slug.js'
import { publicModelUrl, uploadModel } from '../upload.js'

export const adminWeaponsRouter = Router()

const weaponSchema = z.object({
  name: z.string().trim().min(1).max(64),
  subtitle: z.string().trim().max(120).optional().default(''),
  description: z.string().trim().max(120).optional().default(''),
})

adminWeaponsRouter.get('/weapons', (_req, res) => {
  res.json({ ok: true, weapons: listWeapons() })
})

adminWeaponsRouter.post('/weapons', (req, res) => {
  const idResult = z.string().min(1).max(48).safeParse(req.body?.id)
  if (!idResult.success || !isValidSlug(idResult.data)) {
    res.status(400).json({ ok: false, error: 'id должен быть slug: латиница, цифры, дефис' })
    return
  }
  const parsed = weaponSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Проверьте поля формы' })
    return
  }
  if (getWeapon(idResult.data)) {
    res.status(409).json({ ok: false, error: 'Оружие с таким id уже существует' })
    return
  }
  createWeapon({ id: idResult.data, modelUrl: null, ...parsed.data })
  res.status(201).json({ ok: true, weapon: getWeapon(idResult.data) })
})

adminWeaponsRouter.put('/weapons/reorder', (req, res) => {
  const parsed = z.array(z.string()).safeParse(req.body?.order)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Некорректный порядок' })
    return
  }
  reorderWeapons(parsed.data)
  res.json({ ok: true })
})

adminWeaponsRouter.put('/weapons/:weaponId', (req, res) => {
  const weapon = getWeapon(req.params.weaponId)
  if (!weapon) {
    res.status(404).json({ ok: false, error: 'Оружие не найдено' })
    return
  }
  const parsed = weaponSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Проверьте поля формы' })
    return
  }
  updateWeapon(weapon.id, { ...parsed.data, modelUrl: weapon.modelUrl })
  res.json({ ok: true, weapon: getWeapon(weapon.id) })
})

adminWeaponsRouter.delete('/weapons/:weaponId', (req, res) => {
  if (!getWeapon(req.params.weaponId)) {
    res.status(404).json({ ok: false, error: 'Оружие не найдено' })
    return
  }
  deleteWeapon(req.params.weaponId)
  res.json({ ok: true })
})

adminWeaponsRouter.post('/weapons/:weaponId/model', (req, res) => {
  const weapon = getWeapon(req.params.weaponId)
  if (!weapon) {
    res.status(404).json({ ok: false, error: 'Оружие не найдено' })
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
    updateWeapon(weapon.id, {
      name: weapon.name,
      subtitle: weapon.subtitle,
      description: weapon.description,
      modelUrl,
    })
    res.json({ ok: true, modelUrl })
  })
})

// ---------- Categories ----------

const categorySchema = z.object({ name: z.string().trim().min(1).max(48) })

adminWeaponsRouter.post('/weapons/:weaponId/categories', (req, res) => {
  const weapon = getWeapon(req.params.weaponId)
  if (!weapon) {
    res.status(404).json({ ok: false, error: 'Оружие не найдено' })
    return
  }
  const idResult = z.string().min(1).max(48).safeParse(req.body?.id)
  if (!idResult.success || !isValidSlug(idResult.data)) {
    res.status(400).json({ ok: false, error: 'id категории должен быть slug' })
    return
  }
  const parsed = categorySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Укажите название категории' })
    return
  }
  if (weapon.categories.some((c) => c.id === idResult.data)) {
    res.status(409).json({ ok: false, error: 'Категория с таким id уже есть' })
    return
  }
  createWeaponCategory(weapon.id, { id: idResult.data, name: parsed.data.name })
  res.status(201).json({ ok: true, weapon: getWeapon(weapon.id) })
})

adminWeaponsRouter.put('/weapons/:weaponId/categories/reorder', (req, res) => {
  const parsed = z.array(z.string()).safeParse(req.body?.order)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Некорректный порядок' })
    return
  }
  reorderWeaponCategories(req.params.weaponId, parsed.data)
  res.json({ ok: true })
})

adminWeaponsRouter.put('/weapons/:weaponId/categories/:categoryId', (req, res) => {
  const parsed = categorySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Укажите название категории' })
    return
  }
  updateWeaponCategory(req.params.weaponId, req.params.categoryId, parsed.data)
  res.json({ ok: true, weapon: getWeapon(req.params.weaponId) })
})

adminWeaponsRouter.delete('/weapons/:weaponId/categories/:categoryId', (req, res) => {
  deleteWeaponCategory(req.params.weaponId, req.params.categoryId)
  res.json({ ok: true, weapon: getWeapon(req.params.weaponId) })
})

// ---------- Category options ----------

const optionSchema = z.object({ name: z.string().trim().min(1).max(48) })

adminWeaponsRouter.post('/weapons/:weaponId/categories/:categoryId/options', (req, res) => {
  const idResult = z.string().min(1).max(48).safeParse(req.body?.id)
  if (!idResult.success || !isValidSlug(idResult.data)) {
    res.status(400).json({ ok: false, error: 'id опции должен быть slug' })
    return
  }
  const parsed = optionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Укажите название опции' })
    return
  }
  createWeaponOption(req.params.weaponId, req.params.categoryId, {
    id: idResult.data,
    name: parsed.data.name,
    modelUrl: null,
  })
  res.status(201).json({ ok: true, weapon: getWeapon(req.params.weaponId) })
})

adminWeaponsRouter.put(
  '/weapons/:weaponId/categories/:categoryId/options/reorder',
  (req, res) => {
    const parsed = z.array(z.string()).safeParse(req.body?.order)
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: 'Некорректный порядок' })
      return
    }
    reorderWeaponOptions(req.params.weaponId, req.params.categoryId, parsed.data)
    res.json({ ok: true })
  },
)

adminWeaponsRouter.put(
  '/weapons/:weaponId/categories/:categoryId/options/:optionId',
  (req, res) => {
    const parsed = optionSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: 'Укажите название опции' })
      return
    }
    const weapon = getWeapon(req.params.weaponId)
    const category = weapon?.categories.find((c) => c.id === req.params.categoryId)
    const existing = category?.options.find((o) => o.id === req.params.optionId)
    updateWeaponOption(req.params.weaponId, req.params.categoryId, req.params.optionId, {
      name: parsed.data.name,
      modelUrl: existing?.modelUrl ?? null,
    })
    res.json({ ok: true, weapon: getWeapon(req.params.weaponId) })
  },
)

adminWeaponsRouter.post(
  '/weapons/:weaponId/categories/:categoryId/options/:optionId/model',
  (req, res) => {
    const weapon = getWeapon(req.params.weaponId)
    const category = weapon?.categories.find((c) => c.id === req.params.categoryId)
    const option = category?.options.find((o) => o.id === req.params.optionId)
    if (!option) {
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
      updateWeaponOption(req.params.weaponId, req.params.categoryId, req.params.optionId, {
        name: option.name,
        modelUrl,
      })
      res.json({ ok: true, modelUrl })
    })
  },
)

adminWeaponsRouter.delete(
  '/weapons/:weaponId/categories/:categoryId/options/:optionId',
  (req, res) => {
    deleteWeaponOption(req.params.weaponId, req.params.categoryId, req.params.optionId)
    res.json({ ok: true, weapon: getWeapon(req.params.weaponId) })
  },
)
