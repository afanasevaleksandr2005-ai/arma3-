import { Router } from 'express'
import { getPublicCatalog } from '../catalogRepo.js'

export const publicCatalogRouter = Router()

publicCatalogRouter.get('/catalog', (_req, res) => {
  res.json(getPublicCatalog())
})
