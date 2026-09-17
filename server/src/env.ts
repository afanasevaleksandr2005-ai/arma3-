function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: required('JWT_SECRET', process.env.NODE_ENV === 'production' ? undefined : 'dev-only-insecure-secret'),
  dbPath: process.env.DB_PATH ?? 'server/data/app.db',
  uploadsDir: process.env.UPLOADS_DIR ?? 'server/data/uploads',
  bootstrapAdminUsername: process.env.ADMIN_USERNAME,
  bootstrapAdminPassword: process.env.ADMIN_PASSWORD,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramAdminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
  clientOrigin: process.env.CLIENT_ORIGIN,
}
