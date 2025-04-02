import dotenv from 'dotenv';

// Загружаем переменные окружения из .env файла
dotenv.config();

export const env = {
  // API URLs
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
  moySkladApiUrl: process.env.MOYSKLAD_API_URL || 'https://api.moysklad.ru/api/remap/1.2',

  // API Tokens
  moySkladToken: process.env.MOYSKLAD_TOKEN,

  // Database URLs
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,

  // Supabase Configuration
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Telegram Configuration
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramSecretKey: process.env.TELEGRAM_SECRET_KEY,
  telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME,

  // URLs
  webappUrl: process.env.NEXT_PUBLIC_WEBAPP_URL || 'http://localhost:3000',
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  nextAuthSecret: process.env.NEXTAUTH_SECRET,

  // Cache TTL
  cacheTtlProducts: parseInt(process.env.CACHE_TTL_PRODUCTS || '300000'),
  cacheTtlCategories: parseInt(process.env.CACHE_TTL_CATEGORIES || '3600000'),
  cacheTtlStock: parseInt(process.env.CACHE_TTL_STOCK || '300000'),
  cacheTtlImages: parseInt(process.env.CACHE_TTL_IMAGES || '86400000'),

  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3002')
} as const; 