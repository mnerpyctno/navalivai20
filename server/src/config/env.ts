import { config } from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Загружаем переменные окружения только в development
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(process.cwd(), '.env');
  console.log('Загрузка .env файла из:', envPath);
  console.log('Текущая рабочая директория:', process.cwd());
  config({ path: envPath });
}

// Отладочный вывод загруженных переменных
console.log('Загруженные переменные окружения:');
console.log('PORT:', process.env.PORT);
console.log('MOYSKLAD_TOKEN:', process.env.MOYSKLAD_TOKEN ? 'установлен' : 'отсутствует');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'установлен' : 'отсутствует');
console.log('TELEGRAM_BOT_USERNAME:', process.env.TELEGRAM_BOT_USERNAME ? 'установлен' : 'отсутствует');
console.log('TELEGRAM_SECRET_KEY:', process.env.TELEGRAM_SECRET_KEY ? 'установлен' : 'отсутствует');
console.log('NEXT_PUBLIC_WEBAPP_URL:', process.env.NEXT_PUBLIC_WEBAPP_URL ? 'установлен' : 'отсутствует');

// Проверяем наличие обязательных переменных
const requiredEnvVars = [
  'MOYSKLAD_TOKEN',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_BOT_USERNAME',
  'TELEGRAM_SECRET_KEY',
  'NEXT_PUBLIC_WEBAPP_URL'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Ошибка: ${envVar} не установлен в переменных окружения`);
    process.exit(1);
  }
}

const envSchema = z.object({
  // API Tokens
  MOYSKLAD_TOKEN: z.string().nonempty('MOYSKLAD_TOKEN is required'),
  MOYSKLAD_API_URL: z.string().default('https://api.moysklad.ru/api/remap/1.2'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  databaseUrl: z.string().optional(),
  
  // Supabase
  supabaseUrl: z.string().url().optional(),
  supabaseKey: z.string().optional(),
  supabaseServiceKey: z.string().optional(),
  
  // Telegram
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_BOT_USERNAME: z.string(),
  TELEGRAM_SECRET_KEY: z.string(),
  NEXT_PUBLIC_WEBAPP_URL: z.string(),
  
  // Server
  PORT: z.string().transform((val) => {
    const num = Number(val);
    if (isNaN(num)) {
      console.error('PORT не является числом:', val);
      return process.env.NODE_ENV === 'production' ? undefined : 3000;
    }
    return num;
  }).optional(),
  
  // Cache TTL
  cacheTtl: z.object({
    products: z.number().default(3600),
    categories: z.number().default(86400),
    stock: z.number().default(300),
    images: z.number().default(86400)
  }),

  // CORS
  CLIENT_URL: z.string().default('https://navalivai20.vercel.app'),

  // API URL
  API_URL: z.string().default('https://navalivai20.vercel.app/api'),

  // Server URL
  SERVER_URL: z.string().default('https://navalivai20.vercel.app/api')
});

let env: ReturnType<typeof envSchema.parse>;

try {
  const envData = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    MOYSKLAD_TOKEN: process.env.MOYSKLAD_TOKEN,
    MOYSKLAD_API_URL: process.env.MOYSKLAD_API_URL,
    CLIENT_URL: process.env.CORS_ORIGIN || 'https://navalivai20.vercel.app',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://navalivai20.vercel.app',
    API_URL: process.env.API_URL || 'https://navalivai20.vercel.app/api',
    SERVER_URL: process.env.SERVER_URL || 'https://navalivai20.vercel.app/api',
    databaseUrl: process.env.DATABASE_URL,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME,
    TELEGRAM_SECRET_KEY: process.env.TELEGRAM_SECRET_KEY,
    NEXT_PUBLIC_WEBAPP_URL: process.env.NEXT_PUBLIC_WEBAPP_URL,
    PORT: process.env.NODE_ENV === 'production' ? undefined : (process.env.PORT || '3000'),
    cacheTtl: {
      products: Number(process.env.CACHE_TTL_PRODUCTS) || 3600,
      categories: Number(process.env.CACHE_TTL_CATEGORIES) || 86400,
      stock: Number(process.env.CACHE_TTL_STOCK) || 300,
      images: Number(process.env.CACHE_TTL_IMAGES) || 86400
    }
  };
  env = envSchema.parse(envData);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Ошибка валидации переменных окружения:', error.errors);
    process.exit(1);
  } else {
    throw error;
  }
}

export { env };
