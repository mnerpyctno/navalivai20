import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import productsRouter from './api/products';
import categoriesRouter from './api/categories';

const app = express();
const port = process.env.PORT || 3002;

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

app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    query: req.query,
    timestamp: new Date().toISOString()
  });
  next();
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
if (process.env.NODE_ENV === 'production') {
  console.log(`Сервер запущен в production-режиме на http://localhost:${port}`);
} else {
  console.log(`Сервер запущен на http://localhost:${port}`);
}

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});

export default app;
