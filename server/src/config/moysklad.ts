import axios, { AxiosInstance } from 'axios';
import { env } from './env';
import FormData from 'form-data';

// Устанавливаем FormData в глобальную область
global.FormData = FormData as unknown as typeof globalThis.FormData;

if (!env.MOYSKLAD_TOKEN) {
  console.error('Ошибка: MOYSKLAD_TOKEN не установлен.');
  throw new Error('MOYSKLAD_TOKEN отсутствует в переменных окружения.');
}

export const moySkladClient: AxiosInstance = axios.create({
  baseURL: env.MOYSKLAD_API_URL || 'https://api.moysklad.ru/api/remap/1.2',
  headers: {
    'Authorization': `Bearer ${env.MOYSKLAD_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'X-Lognex-Format': 'true',
    'X-Lognex-Pretty-Print': 'true'
  },
  timeout: 30000,
  maxRedirects: 5,
  validateStatus: (status) => status >= 200 && status < 500
});

// Перехватчик для логирования запросов
moySkladClient.interceptors.request.use((config) => {
  console.log('MoySklad запрос:', {
    url: config.url,
    method: config.method,
    params: config.params,
    headers: config.headers,
    baseURL: config.baseURL,
    timestamp: new Date().toISOString()
  });
  return config;
}, (error) => {
  console.error('Ошибка при отправке запроса MoySklad:', error.message);
  return Promise.reject(error);
});

// Перехватчик для логирования ответов
moySkladClient.interceptors.response.use(
  (response) => {
    console.log('MoySklad успешный ответ:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    console.error('Ошибка MoySklad:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
);

export const moySkladImageClient = axios.create({
  baseURL: '',
  headers: {
    'Authorization': `Bearer ${env.MOYSKLAD_TOKEN}`,
    'Accept': 'image/*'
  },
  responseType: 'arraybuffer'
});

// Добавляем перехватчик для логирования запросов
moySkladImageClient.interceptors.request.use((config) => {
  console.log('MoySklad image request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    timestamp: new Date().toISOString()
  });
  return config;
});

moySkladImageClient.interceptors.response.use(
  (response) => {
    console.log('MoySklad image response:', {
      status: response.status,
      headers: response.headers,
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length'],
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    console.error('MoySklad image error:', {
      error: error.message,
      url: error.config?.url,
      status: error.response?.status,
      headers: error.response?.headers,
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
);
