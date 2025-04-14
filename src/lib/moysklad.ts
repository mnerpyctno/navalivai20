import axios, { AxiosInstance } from 'axios';

if (!process.env.MOYSKLAD_TOKEN) {
  console.error('Ошибка: MOYSKLAD_TOKEN не установлен.');
  throw new Error('MOYSKLAD_TOKEN отсутствует в переменных окружения.');
}

export const moySkladClient: AxiosInstance = axios.create({
  baseURL: process.env.MOYSKLAD_API_URL || 'https://api.moysklad.ru/api/remap/1.2',
  headers: {
    'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'X-Lognex-Format': 'true',
    'X-Lognex-Pretty-Print': 'true',
    'X-Lognex-API-Version': '1.2'
  },
  paramsSerializer: (params) => {
    return Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
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
      headers: response.headers,
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
      headers: error.response?.headers,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
); 