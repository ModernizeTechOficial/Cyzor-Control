export const env = {
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'cyzor_fallback_secret_123',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '1047124317865-u3lntb1f6n8mvtgffkfl99ok91njv0in.apps.googleusercontent.com'
};
