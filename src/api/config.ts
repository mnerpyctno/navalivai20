import axios, { AxiosInstance } from 'axios';
import { env } from '@/config/env';

// Конфигурация API
export const API_VERSION = '1.2';

// Создаем экземпляр axios с базовой конфигурацией
export const createMoySkladClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
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

// Параметры по умолчанию для запросов
export const DEFAULT_PARAMS = {
  limit: 100,
  offset: 0,
  expand: 'product,images,productFolder',
  order: 'name,asc'
} as const;

// Интерфейс для параметров запросов
export interface MoySkladParams {
  limit?: number;
  offset?: number;
  expand?: string;
  filter?: string;
  order?: string;
  [key: string]: any;
} 