import { Router } from 'express';
import { moySkladClient } from '../../config/moysklad';
import { handleMoySkladError } from '../../utils/errorHandler';

const router = Router();

// Получение списка категорий
router.get('/', async (req, res) => {
  try {
    console.log('Запрос категорий:', {
      timestamp: new Date().toISOString()
    });

    const response = await moySkladClient.get('/entity/productfolder', {
      params: {
        limit: 100,
        offset: 0,
        expand: 'productFolder',
        filter: 'archived=false'
      }
    });

    if (!response.data || !response.data.rows) {
      console.error('Ошибка: Пустой ответ от API МойСклад для категорий.');
      return res.status(500).json({ error: 'Ошибка сервера при получении категорий' });
    }

    const categories = response.data.rows.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      parentId: category.productFolder?.id || null,
      pathName: category.pathName || null
    }));

    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      response: (error as any).response?.data,
      status: (error as any).response?.status
    });
    handleMoySkladError(error, res);
  }
});

// Получение категории по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await moySkladClient.get(`/entity/productfolder/${id}`, {
      params: {
        expand: 'productFolder'
      }
    });
    
    if (!response.data) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    const category = {
      id: response.data.id,
      name: response.data.name,
      description: response.data.description || '',
      parentId: response.data.productFolder?.id || null,
      pathName: response.data.pathName || null
    };

    res.json(category);
  } catch (error) {
    handleMoySkladError(error, res);
  }
});

export default router; 