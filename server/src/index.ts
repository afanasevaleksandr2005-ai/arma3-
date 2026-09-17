import cookieParser from 'cookie-parser'
import express from 'express'
import path from 'node:path'
import { bootstrapAdmin, requireAdmin } from './auth.js'
import { env } from './env.js'
import { adminAccountsRouter } from './routes/adminAccounts.js'
import { adminAuthRouter } from './routes/adminAuth.js'
import { adminEquipmentRouter } from './routes/adminEquipment.js'
import { adminOrdersRouter } from './routes/adminOrders.js'
import { adminSettingsRouter } from './routes/adminSettings.js'
import { adminWeaponsRouter } from './routes/adminWeapons.js'
import { orderRouter } from './routes/order.js'
import { publicCatalogRouter } from './routes/publicCatalog.js'

// Both `npm run dev:server` and `npm start` are run from the project root,
// so paths (uploads dir, built frontend) resolve against the current directory.
const projectRoot = process.cwd()

bootstrapAdmin()

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '256kb' }))
app.use(cookieParser())

app.use('/uploads', express.static(path.join(projectRoot, env.uploadsDir)))

app.use('/api', publicCatalogRouter)
app.use('/api', orderRouter)
app.use('/api/admin', adminAuthRouter)
app.use('/api/admin', requireAdmin, adminWeaponsRouter)
app.use('/api/admin', requireAdmin, adminEquipmentRouter)
app.use('/api/admin', requireAdmin, adminSettingsRouter)
app.use('/api/admin', requireAdmin, adminOrdersRouter)
app.use('/api/admin', requireAdmin, adminAccountsRouter)

if (env.nodeEnv === 'production') {
  const distDir = path.join(projectRoot, 'dist')
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      next()
      return
    }
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server] unhandled error:', err)
  res.status(500).json({ ok: false, error: 'Внутренняя ошибка сервера' })
})

app.listen(env.port, () => {
  console.log(`[server] listening on http://localhost:${env.port} (${env.nodeEnv})`)
})
