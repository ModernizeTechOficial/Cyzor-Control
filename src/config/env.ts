export const env = {
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'cyzor_fallback_secret_123',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  geminiApiKey: process.env.GEMINI_API_KEY || ''
};
