import { Router } from 'express';
import { moySkladClient } from '../config/moysklad';
import { handleMoySkladError } from '../utils/errorHandler';
import { Product, MoySkladProduct, StockInfo } from '@/types/product';
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
    const { limit = 24, offset = 0, categoryId } = req.query;

    // Формируем параметры запроса
    const params: any = {
      expand: 'images,salePrices,productFolder,images.rows,images.rows.miniature,images.rows.tiny,images.rows.meta,images.rows.title,images.rows.type,images.rows.mediaType',
      filter: 'archived=false',
      limit: categoryId ? 100 : limit,
      offset: categoryId ? 0 : offset,
      order: 'name,asc'
    };

    // Получаем продукты
    const response = await moySkladClient.get('/entity/product', {
      params
    });

    let filteredProducts = response.data.rows;
    let totalSize = response.data.meta.size;
    
    // Если указан categoryId, фильтруем товары на сервере
    if (categoryId) {
      filteredProducts = filteredProducts.filter((product: any) => 
        product.productFolder?.id === categoryId
      );
      totalSize = filteredProducts.length;

      // Применяем пагинацию после фильтрации
      const startIndex = parseInt(offset as string);
      const endIndex = startIndex + parseInt(limit as string);
      filteredProducts = filteredProducts.slice(startIndex, endIndex);
    }

    // Получаем остатки для всех продуктов
    const stockResponse = await moySkladClient.get('/report/stock/bystore');

    // Создаем карту остатков по ID продукта
    const stockMap = new Map<string, { stock: number; available: boolean }>();
    
    if (stockResponse.data.rows) {
      stockResponse.data.rows.forEach((item: any) => {
        if (item.meta && item.meta.href) {
          const productId = item.meta.href.split('/').pop();
          const stockByStore = item.stockByStore?.[0] || {};
          const stock = stockByStore.stock || 0;
          const reserve = stockByStore.reserve || 0;
          
          stockMap.set(productId, {
            stock,
            available: stock - reserve > 0
          });
        }
      });
    }

    const products = filteredProducts.map((product: any) => {
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
      
      // Получаем URL изображения
      const imageUrl = product.images?.rows?.[0]?.miniature?.href || null;
      
      const finalImageUrl = transformImageUrl(imageUrl);

      const stockInfo = stockMap.get(product.id) || {
        stock: 0,
        available: false
      };

      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: price,
        imageUrl: finalImageUrl,
        categoryId: product.productFolder?.id || '',
        categoryName: product.productFolder?.name || '',
        available: !product.archived && stockInfo.available,
        stock: stockInfo.stock
      };
    });

    res.json({ 
      rows: products,
      meta: {
        size: totalSize,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    handleMoySkladError(error, res);
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
    const response = await moySkladClient.get('/entity/productfolder');
    res.json(response.data);
  } catch (error) {
    handleMoySkladError(error, res);
  }
});

export default router;