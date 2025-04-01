import axios, { AxiosInstance } from 'axios';

// Конфигурация API
export const API_VERSION = '1.2';
export const BASE_URL = '/api/moysklad';

// Создаем экземпляр axios с базовой конфигурацией
export const createMoySkladClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 30000
  });

  // Добавляем интерцепторы для логирования
  client.interceptors.request.use(request => {
    return request;
  });

  client.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      console.error('MoySklad Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params
        }
      });
      return Promise.reject(error);
    }
  );

  return client;
};

// Создаем экземпляр API
export const moySkladClient = createMoySkladClient(); 