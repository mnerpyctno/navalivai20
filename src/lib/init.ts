import { initStock } from './initStock';

/**
 * Инициализация приложения
 */
export async function initApp(): Promise<void> {
  try {
    // Инициализация остатков
    await initStock();
  } catch (error) {
    console.error('Ошибка при инициализации приложения:', error);
    throw error;
  }
} 