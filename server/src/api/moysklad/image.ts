import { Router } from 'express';
import { moySkladImageClient } from '../../config/moysklad';
import { handleMoySkladError } from '../../utils/errorHandler';
import { env } from '../../config/env';

const router = Router();

// Кэш для изображений
const imageCache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>();
const CACHE_TTL = env.cacheTtl.images || 3600000; // 1 час по умолчанию

// Маршрут для обработки изображений по ID
router.get('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    
    if (!imageId) {
      console.log('No image ID provided:', {
        params: req.params,
        timestamp: new Date().toISOString()
      });
      return res.status(400).json({ error: 'Image ID is required' });
    }

<<<<<<< HEAD
    const imageUrl = `https://api.moysklad.ru/api/remap/1.2/download/${imageId}`;
=======
    const imageUrl = `https://api.moysklad.ru/api/remap/1.2/download/${imageId}?miniature=true`;
>>>>>>> 403f6ea (Last version)
    
    console.log('Image request details:', {
      imageId,
      imageUrl,
      timestamp: new Date().toISOString()
    });

    // Проверяем кэш
    const cachedImage = imageCache.get(imageUrl);
    if (cachedImage && Date.now() - cachedImage.timestamp < CACHE_TTL) {
      console.log('Using cached image:', {
        imageId,
        timestamp: new Date().toISOString()
      });
      res.set('Content-Type', cachedImage.contentType);
      return res.send(cachedImage.data);
    }

    const response = await moySkladImageClient.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'image/*'
      }
    });

    console.log('Image response details:', {
      status: response.status,
      headers: response.headers,
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length'],
      timestamp: new Date().toISOString()
    });

    // Сохраняем в кэш
    imageCache.set(imageUrl, {
      data: response.data,
      contentType: response.headers['content-type'] || 'image/jpeg',
      timestamp: Date.now()
    });

    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    console.error('Error processing image:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      imageId: req.params.imageId,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

<<<<<<< HEAD
// Маршрут для обработки изображений по URL
=======
// Старый маршрут для обратной совместимости
>>>>>>> 403f6ea (Last version)
router.get('/', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      console.log('No image URL provided:', {
        query: req.query,
        timestamp: new Date().toISOString()
      });
      return res.status(400).json({ error: 'URL is required' });
    }

    // Декодируем URL
    const decodedUrl = decodeURIComponent(url as string);
    
    console.log('Image request details:', {
      originalUrl: url,
      decodedUrl,
      timestamp: new Date().toISOString()
    });

    // Проверяем кэш
    const cachedImage = imageCache.get(decodedUrl);
    if (cachedImage && Date.now() - cachedImage.timestamp < CACHE_TTL) {
      console.log('Using cached image:', {
        url: decodedUrl,
        timestamp: new Date().toISOString()
      });
      res.set('Content-Type', cachedImage.contentType);
      return res.send(cachedImage.data);
    }

<<<<<<< HEAD
    // Если URL уже содержит miniature=true, удаляем его
    const cleanUrl = decodedUrl.replace(/\?miniature=true$/, '');

    console.log('Fetching image from:', {
      cleanUrl,
      timestamp: new Date().toISOString()
    });

    const response = await moySkladImageClient.get(cleanUrl, {
=======
    // Добавляем базовый URL, если его нет
    const fullUrl = decodedUrl.startsWith('http') ? decodedUrl : `https://api.moysklad.ru/api/remap/1.2${decodedUrl}`;

    console.log('Fetching image from:', {
      fullUrl,
      timestamp: new Date().toISOString()
    });

    // Если URL уже содержит miniature=true, используем его напрямую
    const imageUrl = fullUrl.includes('miniature=true') ? fullUrl : `${fullUrl}`;

    const response = await moySkladImageClient.get(imageUrl, {
>>>>>>> 403f6ea (Last version)
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'image/*'
      }
    });

    console.log('Image response details:', {
      status: response.status,
      headers: response.headers,
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length'],
      timestamp: new Date().toISOString()
    });

    // Сохраняем в кэш
    imageCache.set(decodedUrl, {
      data: response.data,
      contentType: response.headers['content-type'] || 'image/jpeg',
      timestamp: Date.now()
    });

    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    console.error('Error processing image:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: req.query.url,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

export default router; 