import express from 'express';
import { moySkladClient } from '../config/moysklad';
import { Request, Response } from 'express';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { q: query, limit = 24, offset = 0 } = req.query;
    console.log('Search request received:', { query, limit, offset });

    if (!query) {
      console.log('No search query provided');
      return res.status(400).json({ error: 'Search query is required' });
    }

    const encodedQuery = encodeURIComponent(query as string);
    console.log('Encoded query:', encodedQuery);

    const requestParams: any = {
      expand: 'images,salePrices,productFolder,images.rows,images.rows.miniature,images.rows.tiny,images.rows.meta,images.rows.title,images.rows.type,images.rows.mediaType',
      filter: `name~${encodedQuery}`,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: 'name,asc'
    };
    console.log('Request params:', requestParams);

    const response = await moySkladClient.get('/entity/product', { params: requestParams });
    console.log('MoySklad response status:', response.status);
    console.log('MoySklad response data:', response.data);

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

    const products = response.data.rows.map((product: any) => {
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
      
      // Преобразуем URL в формат miniature-prod.moysklad.ru
      const transformImageUrl = (url: string | null) => {
        if (!url) return null;
        
        // Извлекаем ID организации и изображения из URL
        const matches = url.match(/\/download\/([^/]+)\/([^/]+)/);
        if (!matches) return url;
        
        const [_, orgId, imageId] = matches;
        return `https://miniature-prod.moysklad.ru/miniature/${orgId}/documentminiature/${imageId}`;
      };

      const finalImageUrl = transformImageUrl(imageUrl);

      // Получаем информацию о наличии
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
        size: response.data.meta.size,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error: any) {
    console.error('Search error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to search products' });
  }
});

export default router; 