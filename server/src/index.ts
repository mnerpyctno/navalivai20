import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { env } from './config/env';
import productsRouter from './api/products';
import categoriesRouter from './api/categories';

const app = express();
const port = env.PORT || process.env.PORT || 3000;

// Настройка CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Проверка работоспособности сервера
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Обработчик для корневого пути
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'API сервер работает',
    version: '1.0.0',
    environment: env.NODE_ENV
  });
});

// Логирование входящих запросов
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    query: req.query,
    timestamp: new Date().toISOString()
  });
  next();
});

// Прокси для API МойСклад
app.get('/api/ms-proxy', async (req, res) => {
  try {
    const { method, url, params } = req.query;
    if (!method || !url) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const response = await axios.request({
      method: method as string,
      url: url as string,
      params: params ? JSON.parse(params as string) : undefined,
      headers: {
        'Authorization': `Bearer ${env.MOYSKLAD_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data
      });
    } else if (error.request) {
      res.status(503).json({
        error: 'Service Unavailable - MoySklad API is not responding'
      });
    } else {
      res.status(500).json({
        error: error.message
      });
    }
  }
});

// Обработка изображений
app.get('/api/images/*', async (req, res) => {
  try {
    const path = req.path.replace('/api/images/', '');
    const imageUrl = decodeURIComponent(path);
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'image/*'
      }
    });

    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Обработка изображений из МойСклад
app.get('/api/moysklad/image/*', async (req, res) => {
  try {
    const path = req.path.replace('/api/moysklad/image/', '');
    const imageId = path.split('?')[0];
    const response = await axios.get(`https://api.moysklad.ru/api/remap/1.2/download/${imageId}`, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'image/*',
        'Authorization': `Bearer ${env.MOYSKLAD_TOKEN}`
      }
    });

    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching Moysklad image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Подключение маршрутов
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);

// Обработка ошибок
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Запуск сервера
if (env.NODE_ENV === 'production') {
  console.log('Сервер запущен в production-режиме');
} else {
  console.log(`Сервер запущен на http://localhost:${port}`);
}

app.listen(port, () => {
  console.log(`Сервер успешно запущен на порту ${port}`);
});

export default app;
