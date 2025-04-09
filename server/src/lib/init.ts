import { env } from '../config/env';

/**
 * Инициализация приложения
 */
export async function initApp(): Promise<void> {
  try {
    // Проверяем наличие PORT
    if (!env.PORT) {
      throw new Error('Переменная PORT не установлена. Проверьте файл .env.');
    }

    console.log(`Инициализация приложения на порту: ${env.PORT}`);
    // Инициализация приложения
  } catch (error) {
    console.error('Ошибка при инициализации приложения:', error);
    throw error;
  }
}