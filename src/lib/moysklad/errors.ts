import { AxiosError } from 'axios';

export const handleMoySkladError = (error: unknown) => {
  if (error instanceof AxiosError) {
    if (error.response) {
      // Сервер ответил с ошибкой
      console.error('MoySklad API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params
      });

      throw new Error(error.response.data.error || 'Ошибка при обращении к API МойСклад');
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      console.error('Network Error:', {
        request: error.request,
        config: error.config
      });

      throw new Error('Ошибка сети при обращении к API МойСклад');
    } else {
      // Ошибка при настройке запроса
      console.error('Request Error:', error.message);
      throw new Error('Ошибка при настройке запроса к API МойСклад');
    }
  } else {
    // Неизвестная ошибка
    console.error('Unknown Error:', error);
    throw new Error('Неизвестная ошибка при обращении к API МойСклад');
  }
}; 