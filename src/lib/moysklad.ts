import axios, { AxiosInstance, AxiosError } from 'axios';

interface MoySkladError {
  error: string;
  parameter?: string;
  code?: number;
}

interface MoySkladResponse<T> {
  rows: T[];
  meta: {
    href: string;
    type: string;
    mediaType: string;
    size: number;
    limit: number;
    offset: number;
  };
  errors?: MoySkladError[];
}

if (!process.env.MOYSKLAD_TOKEN) {
  console.error('Ошибка: MOYSKLAD_TOKEN не установлен.');
  throw new Error('MOYSKLAD_TOKEN отсутствует в переменных окружения.');
}

const paramsSerializer = (params: Record<string, any>): string => {
  if (!params) return '';
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
};

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
  paramsSerializer,
  timeout: 30000,
  maxRedirects: 5,
  validateStatus: (status) => status < 500 // Принимаем все статусы кроме 5xx
});

// Перехватчик для логирования запросов
moySkladClient.interceptors.request.use((config) => {
  // Убеждаемся, что параметры правильно сериализуются
  if (config.params) {
    const serializedParams = paramsSerializer(config.params);
    if (serializedParams) {
      config.url = `${config.url}?${serializedParams}`;
    }
  }

  console.log('MoySklad запрос:', {
    url: config.url,
    method: config.method,
    params: JSON.stringify(config.params, null, 2),
    serializedParams: config.url?.includes('?') ? config.url.split('?')[1] : '',
    headers: {
      ...config.headers,
      Authorization: '[REDACTED]' // Скрываем токен в логах
    },
    baseURL: config.baseURL,
    timestamp: new Date().toISOString()
  });
  return config;
}, (error) => {
  console.error('Ошибка при отправке запроса MoySklad:', {
    message: error.message,
    stack: error.stack,
    config: error.config ? {
      ...error.config,
      headers: {
        ...error.config.headers,
        Authorization: '[REDACTED]'
      }
    } : undefined
  });
  return Promise.reject(error);
});

// Перехватчик для логирования ответов
moySkladClient.interceptors.response.use(
  (response) => {
    // Если статус 4xx, считаем это ошибкой
    if (response.status >= 400) {
      const error = new Error(`API вернул статус ${response.status}`);
      (error as any).response = response;
      return Promise.reject(error);
    }

    console.log('MoySklad успешный ответ:', {
      url: response.config.url,
      status: response.status,
      data: JSON.stringify(response.data, null, 2),
      headers: response.headers,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error: AxiosError<MoySkladResponse<any>>) => {
    console.error('Ошибка MoySklad:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data ? JSON.stringify(error.response.data, null, 2) : undefined,
      headers: error.response?.headers,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Если есть ошибка от API, выводим её подробно
    if (error.response?.data?.errors) {
      console.error('Ошибки API МойСклад:', JSON.stringify(error.response.data.errors, null, 2));
    }

    // Создаем новую ошибку с более понятным сообщением
    const apiError = new Error(
      error.response?.data?.errors?.[0]?.error || 
      `Ошибка API МойСклад: ${error.message}`
    );
    (apiError as any).response = error.response;
    return Promise.reject(apiError);
  }
); 