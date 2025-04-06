import { z } from 'zod';

// Проверяем наличие обязательных переменных окружения
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_TELEGRAM_BOT_TOKEN',
  'NEXT_PUBLIC_TELEGRAM_BOT_USERNAME',
  'NEXT_PUBLIC_TELEGRAM_SECRET_KEY',
  'NEXT_PUBLIC_WEBAPP_URL'
] as const;

// Логируем значения переменных окружения только на сервере
if (typeof window === 'undefined') {
  console.log('\n=== Server-side Environment Variables ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('=====================================\n');
}

// Проверяем наличие всех обязательных переменных
for (const envVar of requiredEnvVars) {
  if (typeof window === 'undefined' && !process.env[envVar]) {
    console.error(`Missing environment variable: ${envVar}`);
    throw new Error(`Отсутствует обязательная переменная окружения: ${envVar}`);
  }
}

const envSchema = z.object({
  // API URL
  API_URL: z.string().default('https://navalivai20.vercel.app'),
  
  // Database
  databaseUrl: z.string().url().optional(),
  
  // Supabase
  supabaseUrl: z.string().url().optional(),
  supabaseKey: z.string().optional(),
  supabaseServiceKey: z.string().optional(),
  
  // Telegram
  telegramBotToken: z.string().optional(),
  telegramBotUsername: z.string().optional(),
  telegramSecretKey: z.string().optional(),
  webappUrl: z.string().optional(),
  
  // Cache TTL
  cacheTtl: z.object({
    products: z.number().default(0),
    categories: z.number().default(0),
    stock: z.number().default(0),
    images: z.number().default(0)
  })
});

// Используем process.env напрямую
export const env = envSchema.parse({
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  telegramBotToken: process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN,
  telegramBotUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  telegramSecretKey: process.env.NEXT_PUBLIC_TELEGRAM_SECRET_KEY,
  webappUrl: process.env.NEXT_PUBLIC_WEBAPP_URL,
  cacheTtl: {
    products: Number(process.env.NEXT_PUBLIC_CACHE_TTL_PRODUCTS) || 0,
    categories: Number(process.env.NEXT_PUBLIC_CACHE_TTL_CATEGORIES) || 0,
    stock: Number(process.env.NEXT_PUBLIC_CACHE_TTL_STOCK) || 0,
    images: Number(process.env.NEXT_PUBLIC_CACHE_TTL_IMAGES) || 0
  }
});

// Проверяем, что мы в браузере
export const isBrowser = typeof window !== 'undefined';

// Получаем базовый URL для API
export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'https://navalivai20.vercel.app';
}; 