export const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '';
export const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '';
export const TELEGRAM_SECRET_KEY = process.env.NEXT_PUBLIC_TELEGRAM_SECRET_KEY || '';
export const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || '';

// Проверяем наличие обязательных переменных окружения
if (typeof window !== 'undefined') {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('Missing NEXT_PUBLIC_TELEGRAM_BOT_TOKEN');
  }
  if (!TELEGRAM_BOT_USERNAME) {
    console.error('Missing NEXT_PUBLIC_TELEGRAM_BOT_USERNAME');
  }
  if (!TELEGRAM_SECRET_KEY) {
    console.error('Missing NEXT_PUBLIC_TELEGRAM_SECRET_KEY');
  }
  if (!WEBAPP_URL) {
    console.error('Missing NEXT_PUBLIC_WEBAPP_URL');
  }
} 
