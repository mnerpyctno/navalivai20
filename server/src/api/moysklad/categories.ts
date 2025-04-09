import { Router } from 'express';
import { moySkladClient } from '../../config/moysklad';
import { handleMoySkladError } from '../../utils/errorHandler';

const router = Router();

// Получение списка категорий
router.get('/', async (req, res) => {
  try {
    const requestParams = {
      limit: 100,
      offset: 0,
      expand: 'productFolder',
      filter: 'archived=false'
    };

    console.log('Запрос категорий:', {
      params: requestParams,
      timestamp: new Date().toISOString()
    });

    const response = await moySkladClient.get('/entity/productfolder', {
      params: requestParams
    });

    console.log('Ответ от МойСклад:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });

    if (!response.data || !response.data.rows) {
      console.error('Ошибка: Пустой ответ от API МойСклад для категорий:', {
        response: response.data,
        status: response.status
      });
      return res.status(500).json({ error: 'Ошибка сервера при получении категорий' });
    }

    const categories = response.data.rows.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      parentId: category.productFolder?.id || null,
      pathName: category.pathName || null
    }));

    console.log('Преобразованные категории:', {
      count: categories.length,
      timestamp: new Date().toISOString()
    });

    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      response: (error as any).response?.data,
      status: (error as any).response?.status,
      config: {
        url: (error as any).config?.url,
        method: (error as any).config?.method,
        params: (error as any).config?.params,
        headers: (error as any).config?.headers
      }
    });
    handleMoySkladError(error, res);
  }
});

// Получение категории по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requestParams = {
      expand: 'productFolder'
    };

    console.log('Запрос категории по ID:', {
      id,
      params: requestParams,
      timestamp: new Date().toISOString()
    });

    const response = await moySkladClient.get(`/entity/productfolder/${id}`, {
      params: requestParams
    });
    
    console.log('Ответ от МойСклад для категории:', {
      id,
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
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