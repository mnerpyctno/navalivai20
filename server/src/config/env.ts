import { config } from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Загружаем переменные окружения
const envPath = path.resolve(__dirname, '../../../.env'); // Исправлен путь
config({ path: envPath });

const envSchema = z.object({
  // API Tokens
  MOYSKLAD_TOKEN: z.string().nonempty('MOYSKLAD_TOKEN is required'),
  MOYSKLAD_API_URL: z.string().default('https://api.moysklad.ru/api/remap/1.2'),
  
  // Database
  SUPABASE_URL: z.string().nonempty('databaseUrl is required'),
  
  // Supabase
  supabaseUrl: z.string().url().optional(),
  supabaseKey: z.string().optional(),
  supabaseServiceKey: z.string().optional(),
  
  // Telegram
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_BOT_USERNAME: z.string(),
  TELEGRAM_SECRET_KEY: z.string(),
  NEXT_PUBLIC_WEBAPP_URL: z.string(),
  
  // Cache TTL
  cacheTtl: z.object({
    products: z.number().default(3600),
    categories: z.number().default(86400),
    stock: z.number().default(300),
    images: z.number().default(86400)
  }).default({}),

  // CORS
  CLIENT_URL: z.string().default('https://navalivai20.vercel.app'),

  // API URL
  API_URL: z.string().default('https://navalivai20.vercel.app/api'),

  // Server URL
  SERVER_URL: z.string().default('https://navalivai20.vercel.app/api'),

  PORT: z.string().default('3000')
});

let env: ReturnType<typeof envSchema.parse>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Ошибка валидации переменных окружения:', error.errors);
    process.exit(1);
  } else {
    throw error;
  }
}

export { env };
