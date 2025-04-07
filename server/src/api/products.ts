import { Router } from 'express';
import { moySkladClient } from '../config/moysklad';
import { handleMoySkladError } from '../utils/errorHandler';
import { Product, MoySkladProduct, StockInfo } from '../types/product';
import { env } from '../config/env';

const router = Router();

// Преобразуем URL в формат miniature-prod.moysklad.ru
const transformImageUrl = (url: string | null) => {
  if (!url) return null;
  
  // Извлекаем ID организации и изображения из URL
  const matches = url.match(/\/download\/([^/]+)\/([^/]+)/);
  if (!matches) return url;
  
  const [_, orgId, imageId] = matches;
  return `https://miniature-prod.moysklad.ru/miniature/${orgId}/documentminiature/${imageId}`;
};

// Получение остатков для продукта
async function getProductStock(productId: string): Promise<StockInfo> {
  try {
    const stockResponse = await moySkladClient.get('/report/stock/bystore', {
      params: {
        filter: `product=https://api.moysklad.ru/api/remap/1.2/entity/product/${productId}`
      }
    });

    if (!stockResponse.data.rows || !stockResponse.data.rows.length) {
      return {
        stock: 0,
        reserve: 0,
        inTransit: 0,
        available: false
      };
    }

    const stockItem = stockResponse.data.rows[0];
    const stockByStore = stockItem.stockByStore?.[0] || {};
    
    return {
      stock: stockByStore.stock || 0,
      reserve: stockByStore.reserve || 0,
      inTransit: stockByStore.inTransit || 0,
      available: (stockByStore.stock || 0) - (stockByStore.reserve || 0) > 0
    };
  } catch (error) {
    console.error('Error fetching product stock:', error);
    throw error;
  }
}

// Получение списка продуктов
router.get('/', async (req, res) => {
  try {
    const { q = '', limit = 24, offset = 0 } = req.query;

    console.log('Запрос продуктов:', {
      query: { q, limit, offset },
      timestamp: new Date().toISOString()
    });

    const params: any = {
      filter: `archived=false;name~=${q}`,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      expand: 'images,salePrices,productFolder'
    };

    const response = await moySkladClient.get('/entity/product', { params });

    if (!response.data || !response.data.rows) {
      console.error('Ошибка: Пустой ответ от API МойСклад для продуктов.');
      return res.status(500).json({ error: 'Ошибка сервера при получении продуктов' });
    }

    const products = response.data.rows.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.salePrices?.[0]?.value / 100 || 0,
      imageUrl: product.images?.rows?.[0]?.miniature?.href || null,
      categoryId: product.productFolder?.id || '',
      available: !product.archived
    }));

    res.json({
      rows: products,
      meta: response.data.meta
    });
  } catch (error) {
    const err = error as any; // Приведение типа
    console.error('Ошибка при получении продуктов:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      response: err.response?.data,
      status: err.response?.status
    });
    res.status(500).json({ error: 'Ошибка сервера при получении продуктов' });
  }
});

// Получение изображений продукта
router.get('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await moySkladClient.get(`/entity/product/${id}`, {
      params: {
        expand: 'images,images.rows,images.rows.miniature,images.rows.tiny,images.rows.meta'
      }
    });

    const images = response.data.images?.rows?.map((image: any) => ({
      ...image,
      miniature: {
        ...image.miniature,
        downloadHref: transformImageUrl(image.miniature?.href)
      },
      tiny: {
        ...image.tiny,
        downloadHref: transformImageUrl(image.tiny?.href)
      }
    })) || [];

    res.json({ rows: images });
  } catch (error) {
    handleMoySkladError(error, res);
  }
});

// Получение продукта по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Modal window product request:', {
      productId: id,
      params: req.params,
      query: req.query,
      timestamp: new Date().toISOString()
    });
    
    const response = await moySkladClient.get(`/entity/product/${id}`, {
      params: {
        expand: 'images,salePrices,productFolder,images.rows,images.rows.miniature,images.rows.tiny,images.rows.meta,images.rows.title,images.rows.type,images.rows.mediaType'
      }
    });
    const product = response.data;

    console.log('📦 Modal window raw product data:', {
      id: product.id,
      name: product.name,
      salePrices: product.salePrices,
      images: product.images,
      timestamp: new Date().toISOString()
    });

    // Получаем URL изображения
    const imageUrl = product.images?.rows?.[0]?.miniature?.href || null;
    const finalImageUrl = transformImageUrl(imageUrl);

    // Пробуем найти цену в следующем порядке:
    // 1. Цена продажи
    // 2. Розничная цена
    // 3. Цена
    // 4. Первая доступная цена
    const retailPrice = product.salePrices?.find((price: { priceType?: { name: string } }) => 
      price.priceType?.name === 'Цена продажи' || 
      price.priceType?.name === 'Розничная цена' ||
      price.priceType?.name === 'Цена'
    ) || product.salePrices?.[0];

    // Если цена существует, делим на 100, иначе 0
    const price = retailPrice?.value ? retailPrice.value / 100 : 0;

    // Получаем остатки для продукта
    const stockData = await getProductStock(id);

    const result = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: price,
      imageUrl: finalImageUrl,
      categoryId: product.productFolder?.id || '',
      categoryName: product.productFolder?.name || '',
      article: product.article || '',
      weight: product.weight || 0,
      volume: product.volume || 0,
      isArchived: product.archived || false,
      available: !product.archived && stockData.available,
      stock: stockData.stock || 0,
      hasImage: !!finalImageUrl
    };

    res.json(result);
  } catch (error) {
    handleMoySkladError(error, res);
  }
});

// Получение категорий
router.get('/categories', async (req, res) => {
  try {
    console.log('Запрос категорий:', {
      timestamp: new Date().toISOString()
    });

    const response = await moySkladClient.get('/entity/productfolder');

    if (!response.data || !response.data.rows) {
      console.error('Ошибка: Пустой ответ от API МойСклад для категорий.');
      return res.status(500).json({ error: 'Ошибка сервера при получении категорий' });
    }

    const categories = response.data.rows.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      parentId: category.pathName || null
    }));

    res.json(categories);
  } catch (error) {
    const err = error as any; // Приведение типа
    console.error('Ошибка при получении категорий:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      response: err.response?.data,
      status: err.response?.status
    });
    res.status(500).json({ error: 'Ошибка сервера при получении категорий' });
  }
});

export default router;