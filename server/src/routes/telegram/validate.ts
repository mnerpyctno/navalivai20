import { Request, Response } from 'express';
import { TELEGRAM_CONFIG } from '../../config/telegram';
import { createHmac } from 'crypto';

export async function validateTelegramData(req: Request, res: Response) {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ ok: false, error: 'No init data provided' });
    }

    // Разбираем строку initData
    const searchParams = new URLSearchParams(initData);
    const hash = searchParams.get('hash');
    searchParams.delete('hash');

    // Сортируем оставшиеся параметры
    const params = Array.from(searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем HMAC-SHA256
    const hmac = createHmac('sha256', TELEGRAM_CONFIG.secretKey);
    hmac.update(params);
    const calculatedHash = hmac.digest('hex');

    // Сравниваем хеши
    if (calculatedHash === hash) {
      res.json({ ok: true });
    } else {
      res.status(400).json({ ok: false, error: 'Invalid hash' });
    }
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    res.status(500).json({ ok: false, error: 'Validation failed' });
  }
} 