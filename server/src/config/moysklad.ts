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
    'Content-Type': 'application/json;charset=utf-8',
    'Accept': 'application/json;charset=utf-8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 30000 // Увеличиваем таймаут для стабильности
});

// Добавляем перехватчик для логирования запросов
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
});

// Добавляем перехватчик для логирования ответов
moySkladClient.interceptors.response.use(
  (response) => {
    console.log('MoySklad ответ:', {
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
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для логирования запросов
moySkladClient.interceptors.request.use((config) => {
  console.log('MoySklad request details:', {
    url: config.url,
    method: config.method,
    params: config.params,
    headers: config.headers,
    baseURL: config.baseURL,
    timestamp: new Date().toISOString()
  });
  return config;
});

// Добавляем перехватчик для логирования ответов
moySkladClient.interceptors.response.use(
  (response) => {
    // Проверяем, что это запрос продуктов и находим нужный продукт
    if (response.config.url?.includes('/entity/product') && !response.config.url.includes('/images')) {
      const targetProduct = response.data.rows?.find((row: any) => row.id === '43916c6f-0ce2-11f0-0a80-0c4900510119');
      
      if (targetProduct) {
        console.log('🔍 Target product API response:', {
          url: response.config.url,
          method: response.config.method,
          status: response.status,
          statusText: response.statusText,
          product: {
            id: targetProduct.id,
            name: targetProduct.name,
            images: {
              meta: targetProduct.images?.meta,
              rows: targetProduct.images?.rows?.map((img: any) => ({
                id: img.id,
                title: img.title,
                filename: img.filename,
                miniature: img.miniature,
                tiny: img.tiny,
                meta: img.meta
              }))
            }
          },
          timestamp: new Date().toISOString()
        });
      }
    }
    return response;
  },
  (error) => {
    console.error('MoySklad error details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для логирования ошибок
moySkladClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Ошибка при запросе к МойСклад API:', {
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

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