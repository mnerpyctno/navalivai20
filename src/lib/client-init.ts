export async function initClientApp(): Promise<void> {
  try {
    // Проверяем доступность API
    const response = await fetch('/api/health');
    if (!response.ok) {
      throw new Error('API недоступен');
    }
    
    console.log('Клиентская инициализация успешно завершена');
  } catch (error) {
    console.error('Ошибка при инициализации клиента:', error);
    throw error;
  }
} 