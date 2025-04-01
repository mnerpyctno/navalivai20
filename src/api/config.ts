import axios, { AxiosInstance } from 'axios';

// Конфигурация API
export const API_VERSION = '1.2';
export const BASE_URL = process.env.MOYSKLAD_API_URL || 'https://api.moysklad.ru/api/remap/1.2';

// Создаем экземпляр axios с базовой конфигурацией
export const createMoySkladClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`,
      'Accept': 'application/json'
    }
  });

  // Добавляем интерцепторы для обработки ошибок
  client.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        // Сервер ответил с ошибкой
        console.error('API Error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params
        });
      } else if (error.request) {
        // Запрос был сделан, но ответ не получен
        console.error('Network Error:', {
          request: error.request,
          config: error.config
        });
      } else {
        // Ошибка при настройке запроса
        console.error('Request Error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Создаем экземпляр API
export const moySkladClient = createMoySkladClient(); 