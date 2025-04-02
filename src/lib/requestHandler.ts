import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { moySkladClient } from '@/api/config';
import { handleMoySkladError } from './errors';

// Используем единый клиент API
const client = moySkladClient;

// Добавляем интерцепторы для логирования
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Логируем запрос
    console.debug('API Request:', {
      url: config.url,
      method: config.method,
      params: config.params,
      headers: config.headers
    });

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response: AxiosResponse) => {
    // Логируем ответ
    console.debug('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });

    return response;
  },
  (error) => {
    // Обрабатываем ошибки
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        params: error.config?.params
      });
    }
    return Promise.reject(error);
  }
);

export const handleResponse = <T>(response: AxiosResponse): T => {
  return response.data;
};

export const handleError = (error: any): never => {
  return handleMoySkladError(error);
};

export default client; 