import { Router } from 'express';
import { moySkladClient } from '../config/moysklad';
import { handleMoySkladError } from '../utils/errorHandler';

const router = Router();

// Получение списка категорий
router.get('/', async (_req, res) => {
  try {
    const response = await moySkladClient.get('/entity/productfolder');

    const categories = response.data.rows.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      parentId: category.pathName || null
    }));

    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    handleMoySkladError(error, res);
  }
});

export default router;