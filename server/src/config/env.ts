import { config } from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Загружаем переменные окружения
const envPath = path.resolve(__dirname, '../../.env');
config({ path: envPath });

// Проверяем наличие обязательных переменных
if (!process.env.MOYSKLAD_TOKEN) {
  console.error('Ошибка: MOYSKLAD_TOKEN не установлен в .env файле');
  process.exit(1);
}

const envSchema = z.object({
  // API Tokens
  MOYSKLAD_TOKEN: z.string(),
  
  // Database
  databaseUrl: z.string().url().optional(),
  
  // Supabase
  supabaseUrl: z.string().url().optional(),
  supabaseKey: z.string().optional(),
  supabaseServiceKey: z.string().optional(),
  
  // Telegram
  telegramBotToken: z.string().optional(),
  
  // Cache TTL
  cacheTtl: z.object({
    products: z.number().default(3600),
    categories: z.number().default(86400),
    stock: z.number().default(300),
    images: z.number().default(86400)
  }),

  // CORS
  CLIENT_URL: z.string().default('http://localhost:3000'),

  // API URL
  API_URL: z.string().default('http://localhost:3002'),

  // Server URL
  SERVER_URL: z.string().default('http://localhost:3002')
});

// Парсим переменные окружения
export const env = envSchema.parse({
  MOYSKLAD_TOKEN: process.env.MOYSKLAD_TOKEN,
  CLIENT_URL: process.env.CORS_ORIGIN || 'http://localhost:3000',
  API_URL: process.env.API_URL || 'http://localhost:3002',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:3002',
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  cacheTtl: {
    products: Number(process.env.CACHE_TTL_PRODUCTS) || 3600,
    categories: Number(process.env.CACHE_TTL_CATEGORIES) || 86400,
    stock: Number(process.env.CACHE_TTL_STOCK) || 300,
    images: Number(process.env.CACHE_TTL_IMAGES) || 86400
  }
}); 