import { Router } from 'express';
import { moySkladClient } from '../config/moysklad';
import { handleMoySkladError } from '../utils/errorHandler';

const router = Router();

// Получение списка категорий
router.get('/', async (_req, res) => {
  try {
    console.log('Fetching categories...');
    const response = await moySkladClient.get('/entity/productfolder');

    if (!response.data || !response.data.rows) {
      console.error('Ошибка: Пустой ответ от API МойСклад для категорий.');
      return res.status(500).json({ error: 'Ошибка сервера при получении категорий' });
    }

    const categories = response.data.rows.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      parentId: category.pathName || null,
    }));

    res.json(categories);
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error fetching categories:', {
        message: err.message,
        stack: err.stack,
        response: (err as any).response?.data,
        status: (err as any).response?.status,
      });
      handleMoySkladError(err, res);
    } else {
      console.error('Unknown error fetching categories:', err);
      res.status(500).json({ error: 'Unknown error occurred' });
    }
  }
});

export default router;
