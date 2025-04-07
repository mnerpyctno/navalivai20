
import { TELEGRAM_CONFIG } from '../../../server/src/config/telegram'; // Обновлен импорт
import { TelegramWebAppData, SendMessageParams } from '../../../server/src/config/telegram'; // Обновлен импорт

let crypto: typeof import('crypto');

// Проверяем, что мы находимся на сервере, так как crypto доступен только там
if (typeof window === 'undefined') {
  crypto = require('crypto');
} else {
  console.warn('Crypto operations are only available on the server side');
}

export const verifyTelegramWebAppData = (data: TelegramWebAppData): boolean => {
  try {
    if (typeof window !== 'undefined') {
      console.warn('WebApp data verification is only available on the server side');
      return false;
    }

    if (!TELEGRAM_CONFIG.botToken) {
      throw new Error('Telegram bot token is not configured');
    }

    const secretKey = crypto.createHash('sha256')
      .update(TELEGRAM_CONFIG.botToken)
      .digest();

    // ...existing code...

    // Ensure a return value in all code paths
    return true;
  } catch (error) {
    console.error('Error verifying Telegram WebApp data:', error);
    return false;
  }
};