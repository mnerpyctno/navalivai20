import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = 3002;

// Константа с токеном для отладки
const DEBUG_TOKEN = 'd12cc5134f6be8a828f343dca35e93cdb4de05b6';
const MS_TOKEN = process.env.MOYSKLAD_TOKEN || DEBUG_TOKEN;

// Создаем клиент для MoySklad API
const msClient = axios.create({
  baseURL: 'https://api.moysklad.ru/api/remap/1.2',
  headers: {
    'Authorization': `Bearer ${MS_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000,
  validateStatus: function (status: number) {
    return status >= 200 && status < 500;
  }
});

// Добавляем интерцептор для логирования запросов к MoySklad
msClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Ошибка запроса к MoySklad:', error);
    return Promise.reject(error);
  }
);

msClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Ошибка ответа от MoySklad:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        headers: {
          ...error.config?.headers,
          Authorization: 'Bearer ***'
        }
      }
    });
    return Promise.reject(error);
  }
);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Логирование всех запросов
app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  next();
});

// Прокси-эндпоинт для всех запросов к MoySklad
app.get('/api/ms-proxy', async (req: express.Request, res: express.Response) => {
  try {
    const { method, url, params } = req.query;

    if (!method || !url) {
      console.error('Отсутствуют обязательные параметры:', { method, url });
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Преобразуем строковые параметры в объект
    let parsedParams: any = {};
    if (params) {
      try {
        parsedParams = typeof params === 'string' ? JSON.parse(params) : params;
        // Преобразуем строковые значения в числа, где это необходимо
        if (parsedParams.limit) parsedParams.limit = parseInt(parsedParams.limit as string);
        if (parsedParams.offset) parsedParams.offset = parseInt(parsedParams.offset as string);
      } catch (e) {
        console.error('Ошибка при парсинге параметров:', e);
        return res.status(400).json({ error: 'Invalid parameters format' });
      }
    }

    const requestMethod = (method as string).toLowerCase();
    const requestUrl = (url as string).startsWith('/') ? (url as string).slice(1) : url as string;

    const response = await msClient({
      method: requestMethod,
      url: requestUrl,
      params: parsedParams
    });

    if (response.status === 401) {
      console.error('Ошибка авторизации:', {
        url: response.config.url,
        headers: {
          ...response.config.headers,
          Authorization: 'Bearer ***'
        }
      });
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    if (response.status === 400) {
      console.error('Ошибка запроса:', response.data);
      return res.status(400).json(response.data);
    }

    res.json(response.data);
  } catch (error: any) {
    console.error('Proxy error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        headers: error.config?.headers
      }
    });
    
    if (error.response) {
      // Ответ получен, но с ошибкой
      res.status(error.response.status).json({
        error: error.response.data
      });
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      res.status(503).json({
        error: 'Service Unavailable - MoySklad API is not responding',
        details: error.message
      });
    } else {
      // Ошибка при настройке запроса
      res.status(500).json({
        error: error.message,
        stack: error.stack
      });
    }
  }
});

// Обработка ошибок
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Проверка работоспособности сервера
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 