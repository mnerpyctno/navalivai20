import { Router } from 'express';
import { moySkladClient } from '../config/moysklad';
import { handleMoySkladError } from '../utils/errorHandler';
import { Category, MoySkladCategory } from '../../src/types/category';

const router = Router();

// Кэш для категорий
const categoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

// Получение списка категорий
router.get('/', async (req, res) => {
  try {
    // Проверяем кэш
    const cachedCategories = categoryCache.get('all');
    if (cachedCategories && Date.now() - cachedCategories.timestamp < CACHE_TTL) {
      console.log('Using cached categories');
      return res.json(cachedCategories.data);
    }

    const response = await moySkladClient.get('/entity/productfolder', {
      params: {
        filter: 'archived=false',
        order: 'name,asc',
        limit: 100,
        offset: 0
      }
    });

    const categories = response.data.rows.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      image: category.image?.meta?.href || null
    }));

    // Сохраняем в кэш
    categoryCache.set('all', {
      data: categories,
      timestamp: Date.now()
    });

    res.json({
      rows: categories,
      meta: response.data.meta
    });
  } catch (error) {
    handleMoySkladError(error, res);
  }
});

// Получение категории по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await moySkladClient.get(`/entity/productfolder/${id}`);

    const category: Category = {
      id: response.data.id,
      name: response.data.name,
      description: response.data.description || '',
      image: '/default-category.jpg' // Временно используем дефолтное изображение
    };

    res.json(category);
  } catch (error) {
    handleMoySkladError(error, res);
  }
});

export default router; 