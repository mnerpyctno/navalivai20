import { AxiosError } from 'axios';

interface MoySkladErrorResponse {
  error?: string;
  [key: string]: any;
}

export function handleMoySkladError(error: AxiosError<MoySkladErrorResponse>) {
  console.error('MoySklad API Error:', {
    status: error.response?.status,
    data: error.response?.data,
    headers: error.response?.headers
  });

  if (error.response?.status === 401) {
    throw new Error('Ошибка авторизации. Проверьте токен API.');
  }

  if (error.response?.status === 403) {
    throw new Error('Доступ запрещен. Проверьте права доступа.');
  }

  if (error.response?.status === 404) {
    throw new Error('Запрашиваемый ресурс не найден.');
  }

  if (error.response?.status === 429) {
    throw new Error('Превышен лимит запросов. Пожалуйста, подождите.');
  }

  if (error.response?.status === 503) {
    throw new Error('Сервис временно недоступен. Пожалуйста, попробуйте позже.');
  }

  if (error.response?.data?.error) {
    throw new Error(`Ошибка API: ${error.response.data.error}`);
  }

  throw new Error('Произошла ошибка при запросе к API');
} 