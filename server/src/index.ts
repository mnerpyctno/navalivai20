import express from 'express';
import cors from 'cors';
import { env } from './config/env';
<<<<<<< HEAD
import productsRouter from './api/products';
import categoriesRouter from './api/categories';
=======
import apiRouter from './api/apiRouter';
>>>>>>> 403f6ea (Last version)

const app = express();
const port = process.env.PORT || 3002;

// Настройка CORS
app.use(cors({
<<<<<<< HEAD
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
=======
  origin: env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
>>>>>>> 403f6ea (Last version)
}));

// Middleware
app.use(express.json());

// Проверка работоспособности сервера
<<<<<<< HEAD
app.get('/api/health', (_req, res) => {
=======
app.get('/health', (_req: express.Request, res: express.Response) => {
>>>>>>> 403f6ea (Last version)
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

<<<<<<< HEAD
// Подключение маршрутов
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
=======
// Подключаем все API роуты через единый роутер
app.use('/api', apiRouter);
>>>>>>> 403f6ea (Last version)

// Обработка ошибок
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

<<<<<<< HEAD
// Запуск сервера
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
  });
}

export default app;
=======
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
>>>>>>> 403f6ea (Last version)
