import { z } from 'zod';

// Проверяем наличие обязательных переменных окружения
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'MOYSKLAD_TOKEN'
] as const;

// Логируем значения переменных окружения только на сервере
if (typeof window === 'undefined') {
  console.log('\n=== Server-side Environment Variables ===');
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('MOYSKLAD_TOKEN:', process.env.MOYSKLAD_TOKEN ? 'Установлен' : 'Не установлен');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Все переменные окружения:', Object.keys(process.env));
  console.log('=====================================\n');
} else {
  console.log('\n=== Client-side Environment Variables ===');
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('window.location.origin:', window.location.origin);
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
  // API URLs
  apiUrl: z.string().url(),
  moySkladApiUrl: z.string().url().optional(),
  
  // API Tokens
  moySkladToken: z.string().optional(),
  
  // Database
  databaseUrl: z.string().url().optional(),
  
  // Supabase
  supabaseUrl: z.string().url().optional(),
  supabaseKey: z.string().optional(),
  supabaseServiceKey: z.string().optional(),
  
  // Telegram
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
  
  // Cache TTL (in seconds)
  cacheTtl: z.object({
    products: z.number().min(0),
    categories: z.number().min(0),
    stock: z.number().min(0),
    images: z.number().min(0)
  }),
  
  // Features
  features: z.object({
    enableCache: z.boolean(),
    enableLogging: z.boolean()
  }),
  
  // Environment
  nodeEnv: z.enum(['development', 'production', 'test']),
  
  // Development
  isDevelopment: z.boolean(),
  isProduction: z.boolean()
});

export const env = envSchema.parse({
  // API URLs
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
  moySkladApiUrl: 'https://api.moysklad.ru/api/remap/1.2',
  
  // API Tokens
  moySkladToken: process.env.MOYSKLAD_TOKEN,
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Telegram
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  
  // Cache TTL
  cacheTtl: {
    products: Number(process.env.CACHE_TTL_PRODUCTS) || 300,
    categories: Number(process.env.CACHE_TTL_CATEGORIES) || 3600,
    stock: Number(process.env.CACHE_TTL_STOCK) || 60,
    images: Number(process.env.CACHE_TTL_IMAGES) || 86400
  },
  
  // Features
  features: {
    enableCache: process.env.ENABLE_CACHE === 'true',
    enableLogging: process.env.ENABLE_LOGGING === 'true'
  },
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
});

// Проверяем, что мы в браузере
export const isBrowser = typeof window !== 'undefined';

// Получаем базовый URL для API
export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
}; 