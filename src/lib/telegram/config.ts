import { env } from '@/config/env';

export const TELEGRAM_CONFIG = {
  botToken: env.telegramBotToken,
  botUsername: env.telegramBotUsername,
  secretKey: env.telegramSecretKey,
  webAppUrl: env.webappUrl,
  webhookUrl: `${env.webappUrl}/api/telegram/webhook`
} as const;

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramWebAppData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  query_id?: string;
}

export interface SendMessageParams {
  chat_id: number | string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  reply_markup?: any;
} 