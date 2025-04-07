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
  } catch (error) {
    console.error('Error fetching categories:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      response: error instanceof Error && 'response' in error ? (error.response as any)?.data : undefined,
      status: error instanceof Error && 'response' in error ? (error.response as any)?.status : undefined,
    });
    handleMoySkladError(error, res);
  }
});

export default router;
