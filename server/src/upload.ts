import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { env } from './env.js'

const MODELS_DIR = path.join(env.uploadsDir, 'models')
mkdirSync(MODELS_DIR, { recursive: true })

const ALLOWED_EXTENSIONS = new Set(['.glb', '.gltf'])
const MAX_FILE_SIZE = 80 * 1024 * 1024 // 80 MB — real gear/weapon GLBs are usually well under this

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, MODELS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${randomUUID()}${ext}`)
  },
})

export const uploadModel = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error('Разрешены только файлы .glb или .gltf'))
      return
    }
    cb(null, true)
  },
}).single('model')

export function publicModelUrl(filename: string): string {
  return `/uploads/models/${filename}`
}
