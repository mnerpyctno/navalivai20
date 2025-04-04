import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import apiRouter from './api/apiRouter';

const app = express();
const port = process.env.PORT || 3002;

// Настройка CORS
app.use(cors({
  origin: env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Проверка работоспособности сервера
app.get('/health', (_req: express.Request, res: express.Response) => {
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

// Подключаем все API роуты через единый роутер
app.use('/api', apiRouter);

// Обработка ошибок
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 