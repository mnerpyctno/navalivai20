import axios, { AxiosInstance } from 'axios';
import { TELEGRAM_CONFIG } from '../../../server/src/config/telegram'; // Обновлен импорт
import { createHash, createHmac } from 'crypto';
import { TelegramWebAppData, SendMessageParams } from '../../../server/src/config/telegram'; // Обновлен импорт

class TelegramClient {
  private static instance: TelegramClient;
  private client: AxiosInstance;

  private constructor() {
    this.client = axios.create({
      baseURL: `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}`,
      timeout: 10000
    });
  }

  public static getInstance(): TelegramClient {
    if (!TelegramClient.instance) {
      TelegramClient.instance = new TelegramClient();
    }
    return TelegramClient.instance;
  }

  public async sendMessage(params: SendMessageParams) {
    return this.client.post('/sendMessage', params);
  }
}

export const telegramClient = TelegramClient.getInstance();

export const verifyTelegramWebAppData = (data: TelegramWebAppData): boolean => {
  try {
    if (!TELEGRAM_CONFIG.botToken) {
      throw new Error('Telegram bot token is not configured');
    }

    const secretKey = createHash('sha256')
      .update(TELEGRAM_CONFIG.botToken)
      .digest();

    const dataCheckString = Object.keys(data)
      .filter(key => key !== 'hash')
      .map((key) => `${key}=${data[key as keyof TelegramWebAppData]}`)
      .sort()
      .join('\n');

    const hash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return hash === data.hash;
  } catch (error) {
    console.error('Error verifying Telegram WebApp data:', error);
    return false;
  }
};