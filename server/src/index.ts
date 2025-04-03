import express from 'express';
import { PrismaClient } from '@prisma/client';
import { env } from './config/env';
import axios from 'axios';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();
const port = 3002;

// Константа с токеном для отладки
const DEBUG_TOKEN = 'd12cc5134f6be8a828f343dca35e93cdb4de05b6';
const MS_TOKEN = process.env.MOYSKLAD_TOKEN || DEBUG_TOKEN;

// Создаем клиент для MoySklad API с ограничением запросов
const moySkladClient = axios.create({
  baseURL: 'https://api.moysklad.ru/api/remap/1.2',
  headers: {
    'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Добавляем интерцептор для ограничения частоты запросов
let lastRequestTime = 0;
const minRequestInterval = 100; // минимальный интервал между запросами в мс

moySkladClient.interceptors.request.use(async (config) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < minRequestInterval) {
    await new Promise(resolve => setTimeout(resolve, minRequestInterval - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  return config;
});

// Добавляем интерцептор для обработки ошибок
moySkladClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      console.error('Сетевая ошибка при запросе к MoySklad:', error.code);
      throw new Error('Не удалось подключиться к серверу MoySklad');
    }
    return Promise.reject(error);
  }
);

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'x-lognex-retry-after'],
  maxAge: 86400,
  credentials: true
}));

// Добавляем middleware для установки заголовков кэширования
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Cache-Control, Pragma');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Логирование всех запросов
app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  console.log(`${req.method} ${req.url}`, {
    query: req.query,
    headers: req.headers
  });
  next();
});

// Прокси-эндпоинт для всех запросов к MoySklad
app.get('/proxy', async (req: express.Request, res: express.Response) => {
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

    // Специальная обработка для /report/stock/bystore
    if (requestUrl === 'report/stock/bystore') {
      console.log('Запрос остатков временно отключен');
      return res.json({
        meta: {
          size: 0
        },
        rows: []
      });
    }

    const config = {
      method: requestMethod,
      url: requestUrl,
      params: parsedParams,
      headers: {
        'Authorization': `Bearer ${MS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json;charset=utf-8'
      }
    };

    let retries = 0;
    const maxRetries = 3;
    let lastError: any = null;
    
    while (retries < maxRetries) {
      try {
        const response = await moySkladClient(config);
        return res.json(response.data);
      } catch (error: any) {
        lastError = error;
        
        if (error.response) {
          const status = error.response.status;
          const headers = error.response.headers;
          
          // Если получили ошибку 412 или 429, пробуем повторить запрос
          if ((status === 412 || status === 429) && retries < maxRetries - 1) {
            const retryAfter = parseInt(headers['x-lognex-retry-after'] || '3');
            // Используем экспоненциальную задержку: 3с, 6с, 12с
            const delay = retryAfter * 1000 * Math.pow(2, retries);
            console.log(`Повторная попытка ${retries + 1}/${maxRetries} через ${delay/1000} секунд`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retries++;
            continue;
          }
          
          // Если превысили лимит запросов, возвращаем ошибку с информацией о времени ожидания
          if (status === 429) {
            return res.status(429).json({
              error: 'Too Many Requests',
              retryAfter: headers['x-lognex-retry-after'],
              message: 'Превышен лимит запросов к API MoySklad'
            });
          }
          
          // Если получили ошибку 412, возвращаем специальный ответ
          if (status === 412) {
            return res.status(412).json({
              error: 'Precondition Failed',
              message: 'Условие запроса не выполнено',
              retryAfter: headers['x-lognex-retry-after']
            });
          }
          
          // Для других ошибок возвращаем статус и данные
          return res.status(status).json(error.response.data);
        }
        
        // Если это сетевая ошибка и мы еще не превысили лимит попыток
        if (retries < maxRetries - 1) {
          console.log(`Сетевая ошибка, повторная попытка ${retries + 1}/${maxRetries}`);
          // Используем экспоненциальную задержку: 1с, 2с, 4с
          const delay = 1000 * Math.pow(2, retries);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
          continue;
        }
        
        throw error;
      }
    }
    
    // Если все попытки исчерпаны, возвращаем последнюю ошибку
    throw lastError || new Error('Max retries exceeded');
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
      res.status(error.response.status).json({
        error: error.response.data,
        message: 'Ошибка при обращении к API MoySklad'
      });
    } else if (error.request) {
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Сервис MoySklad временно недоступен'
      });
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Внутренняя ошибка сервера'
      });
    }
  }
});

// Эндпоинт для получения изображений товаров
app.get('/api/products/:productId/images', async (req: express.Request, res: express.Response) => {
  try {
    const { productId } = req.params;
    
    console.log('Fetching images for product:', { productId });
    
    if (!productId) {
      console.error('Product ID is missing');
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    const response = await moySkladClient.get(`entity/product/${productId}`, {
      params: {
        expand: 'images'
      }
    });

    if (response.status === 404) {
      console.error('Product not found:', { productId });
      return res.status(404).json({ error: 'Product not found' });
    }

    if (response.status === 401) {
      console.error('Unauthorized access to MoySklad API:', { productId });
      return res.status(401).json({ error: 'Unauthorized access to MoySklad API' });
    }

    const product = response.data;
    console.log('Product data:', { 
      productId,
      hasImages: !!product.images,
      imageCount: product.images?.rows?.length || 0
    });
    
    if (!product.images || !product.images.rows || product.images.rows.length === 0) {
      console.error('No images found for product:', { productId });
      return res.status(404).json({ error: 'No images found for this product' });
    }
    
    const images = product.images.rows;
    
    // Форматируем изображения в нужный формат
    const formattedImages = images.map((image: any) => ({
      id: image.id || productId,
      title: image.title || '',
      miniature: image.miniature?.href || `/api/images/${productId}?miniature=true`,
      tiny: image.tiny?.href || `/api/images/${productId}?miniature=true`,
      full: image.meta?.href || image.full?.href || `/api/images/${productId}`
    }));

    console.log('Formatted images:', { 
      productId,
      count: formattedImages.length,
      images: formattedImages
    });

    // Устанавливаем заголовки кэширования
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json(formattedImages);
  } catch (error: any) {
    console.error('Error fetching product images:', {
      error: error.message,
      stack: error.stack,
      productId: req.params.productId
    });
    res.status(500).json({ error: 'Failed to fetch product images' });
  }
});

// Эндпоинт для получения остатков товара
app.get('/api/stock', async (req, res) => {
  // Временно отключаем запрос остатков
  console.log('Запрос остатков временно отключен');
  return res.json({
    meta: {
      size: 0
    },
    rows: []
  });
  
  /*
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const response = await moySkladClient.get('report/stock/bystore', {
      params: {
        filter: `product=${productId}`,
        limit: 100
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Stock error:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
  */
});

// Эндпоинт для проксирования изображений товаров
app.get('/api/images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { miniature } = req.query;

    console.log('Image request:', { imageId, miniature });

    if (!imageId) {
      console.error('Image ID is missing');
      return res.status(400).json({ error: 'Image ID is required' });
    }

    // Получаем информацию о продукте
    const productResponse = await moySkladClient.get(`entity/product/${imageId}`, {
      params: {
        expand: 'images'
      }
    });

    const product = productResponse.data;
    
    if (!product) {
      console.error('Product not found:', { imageId });
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.images || !product.images.rows || product.images.rows.length === 0) {
      console.error('No images found for product:', { imageId });
      return res.status(404).json({ error: 'No images found for this product' });
    }

    // Если запрашивается миниатюра, проксируем запрос к миниатюре
    if (miniature === 'true') {
      const image = product.images.rows[0];
      if (image.miniature && image.miniature.href) {
        console.log('Fetching miniature image:', { url: image.miniature.href });
        const imageResponse = await moySkladClient.get(image.miniature.href, {
          responseType: 'arraybuffer'
        });
        
        res.setHeader('Content-Type', imageResponse.headers['content-type']);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        return res.send(imageResponse.data);
      } else if (image.tiny && image.tiny.href) {
        console.log('Fetching tiny image as fallback:', { url: image.tiny.href });
        const imageResponse = await moySkladClient.get(image.tiny.href, {
          responseType: 'arraybuffer'
        });
        
        res.setHeader('Content-Type', imageResponse.headers['content-type']);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        return res.send(imageResponse.data);
      }
    }

    // Для полного изображения
    const image = product.images.rows[0];
    if (image.meta && image.meta.href) {
      console.log('Fetching full image:', { url: image.meta.href });
      const imageResponse = await moySkladClient.get(image.meta.href, {
        responseType: 'arraybuffer'
      });
      
      res.setHeader('Content-Type', imageResponse.headers['content-type']);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.send(imageResponse.data);
    } else if (image.full && image.full.href) {
      console.log('Fetching full image from full property:', { url: image.full.href });
      const imageResponse = await moySkladClient.get(image.full.href, {
        responseType: 'arraybuffer'
      });
      
      res.setHeader('Content-Type', imageResponse.headers['content-type']);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.send(imageResponse.data);
    }

    console.error('Image URL not found for product:', { imageId });
    return res.status(404).json({ error: 'Image URL not found' });
  } catch (error) {
    console.error('Image error:', error);
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'Failed to fetch image from MoySklad',
        details: error.response.data
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
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

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
}); 