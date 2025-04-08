import axios, { AxiosInstance } from 'axios';
import { TELEGRAM_CONFIG } from '../../config/telegram';
import { createHash, createHmac } from 'crypto';
import { TelegramWebAppData, SendMessageParams } from '../../config/telegram';

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

  public validateWebAppData(data: TelegramWebAppData): boolean {
    const { hash, ...dataWithoutHash } = data;
    
    const dataCheckString = Object.entries(dataWithoutHash)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = createHash('sha256')
      .update(TELEGRAM_CONFIG.botToken)
      .digest();

    const expectedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return hash === expectedHash;
  }
}

export const telegramClient = TelegramClient.getInstance();

export const verifyTelegramWebAppData = (data: TelegramWebAppData): boolean => {
  const { hash, ...dataWithoutHash } = data;
    
  const dataCheckString = Object.entries(dataWithoutHash)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = createHash('sha256')
    .update(TELEGRAM_CONFIG.botToken)
    .digest();

  const expectedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return hash === expectedHash;
};