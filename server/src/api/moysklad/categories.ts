import { Router } from 'express';
import { moySkladClient } from '../../config/moysklad';
import { handleMoySkladError } from '../../utils/errorHandler';

const router = Router();

// Получение списка категорий
router.get('/', async (req, res) => {
  try {
    // Формируем параметры запроса
    const requestParams = new URLSearchParams();
    requestParams.append('limit', '100');
    requestParams.append('offset', '0');
    requestParams.append('filter', 'archived=false');

    console.log('Запрос категорий:', {
      params: Object.fromEntries(requestParams),
      timestamp: new Date().toISOString()
    });

    // Формируем URL с параметрами
    const url = `/entity/productfolder?${requestParams.toString()}`;
    console.log('Полный URL запроса:', url);

    // Отправляем запрос
    const response = await moySkladClient.get(url);

    console.log('Ответ от МойСклад:', {
      status: response.status,
      data: response.data,
      errors: response.data?.errors,
      timestamp: new Date().toISOString()
    });

    if (response.status === 400) {
      console.error('Ошибка API МойСклад:', {
        errors: response.data?.errors,
        status: response.status,
        headers: response.headers
      });
      return res.status(400).json({ 
        error: 'Ошибка запроса к API МойСклад',
        details: response.data?.errors 
      });
    }

    if (!response.data || !response.data.rows) {
      console.error('Ошибка: Пустой ответ от API МойСклад для категорий:', {
        response: response.data,
        status: response.status,
        headers: response.headers
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
      headers: (error as any).response?.headers,
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
    
    // Формируем параметры запроса
    const requestParams = new URLSearchParams();
    requestParams.append('expand', 'productFolder');

    console.log('Запрос категории по ID:', {
      id,
      params: Object.fromEntries(requestParams),
      timestamp: new Date().toISOString()
    });

    // Формируем URL с параметрами
    const url = `/entity/productfolder/${id}?${requestParams.toString()}`;
    console.log('Полный URL запроса:', url);

    const response = await moySkladClient.get(url);
    
    console.log('Ответ от МойСклад для категории:', {
      id,
      status: response.status,
      data: response.data,
      headers: response.headers,
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