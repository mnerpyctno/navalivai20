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
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (typeof window === 'undefined' && missingVars.length > 0) {
  console.error('Missing environment variables:', missingVars.join(', '));
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_TELEGRAM_BOT_TOKEN: z.string().min(1),
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: z.string().min(1),
  NEXT_PUBLIC_TELEGRAM_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_WEBAPP_URL: z.string().url(),
  
  // Database
  databaseUrl: z.string().optional(),
  supabaseUrl: z.string().url().optional(),
  supabaseKey: z.string().optional(),
});

const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:', error.errors);
      process.exit(1);
    }
    throw error;
  }
};

export const env = validateEnv();

// Проверяем, что мы в браузере
export const isBrowser = typeof window !== 'undefined';

// Получаем базовый URL для API
export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'https://navalivai20.vercel.app';
};