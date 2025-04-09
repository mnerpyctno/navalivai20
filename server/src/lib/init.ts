/**
 * Инициализация приложения
 */
export async function initApp(): Promise<void> {
  try {
    // Проверяем наличие PORT
    if (!process.env.PORT) {
      throw new Error('Переменная PORT не установлена. Проверьте файл .env.');
    }

    console.log(`Инициализация приложения на порту: ${process.env.PORT}`);
    // Инициализация приложения
  } catch (error) {
    console.error('Ошибка при инициализации приложения:', error);
    throw error;
  }
}