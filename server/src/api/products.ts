import { Router } from 'express';
import { moySkladClient } from '../config/moysklad';
import { handleMoySkladError } from '../utils/errorHandler';
import { Product, MoySkladProduct, StockInfo } from '../../shared/types/product';
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
    const stockMap = new Map<string, StockInfo>();
    
    if (stockResponse.data.rows) {
      stockResponse.data.rows.forEach((item: any) => {
        if (item.meta && item.meta.href) {
          // Извлекаем ID продукта из URL, убирая параметры запроса
          const productId = item.meta.href.split('?')[0].split('/').pop();
          const stockByStore = item.stockByStore?.[0] || {};
          
          stockMap.set(productId, {
            stock: stockByStore.stock || 0,
            reserve: stockByStore.reserve || 0,
            inTransit: stockByStore.inTransit || 0,
            available: (stockByStore.stock || 0) - (stockByStore.reserve || 0)
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

      // Получаем информацию о наличии
      const stockInfo = stockMap.get(product.id) || {
        stock: 0,
        reserve: 0,
        inTransit: 0,
        available: 0
      };

      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: price,
        imageUrl: finalImageUrl,
        categoryId: product.productFolder?.id || '',
        categoryName: product.productFolder?.name || '',
        available: !product.archived && stockInfo.available > 0,
        stock: stockInfo.stock,
        article: product.article,
        weight: product.weight,
        volume: product.volume,
        isArchived: product.archived,
        hasImage: !!finalImageUrl
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

    // Получаем остатки для продукта через наш API
    const stockResponse = await fetch(`${env.API_URL}/api/stock/${id}`);
    const stockData = await stockResponse.json() as StockInfo & { productId: string };

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
      available: !product.archived && stockData.available > 0,
      stock: stockData.stock || 0,
      hasImage: !!finalImageUrl
    };

    console.log('✅ Modal window response:', {
      ...result,
      timestamp: new Date().toISOString()
    });

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