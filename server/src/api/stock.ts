import { Router } from 'express';
import { moySkladClient } from '../config/moysklad';
import { handleMoySkladError } from '../utils/errorHandler';
import { StockInfo } from '../types/product';

const router = Router();

// Получение остатков для всех товаров
router.get('/', async (req, res) => {
  try {
    console.log('Stock API request:', {
      query: req.query,
      timestamp: new Date().toISOString()
    });

    // Получаем остатки по складам
    const stockResponse = await moySkladClient.get('/report/stock/bystore');

    // Преобразуем ответ в удобный формат
    const stockData: Array<StockInfo & { productId: string }> = [];
    
    if (stockResponse.data.rows) {
      stockResponse.data.rows.forEach((item: any) => {
        if (item.meta && item.meta.href) {
          const productId = item.meta.href.split('/').pop();
          const stockByStore = item.stockByStore?.[0] || {};
          const stock = stockByStore.stock || 0;
          const reserve = stockByStore.reserve || 0;
          
          stockData.push({
            productId,
            stock,
            reserve,
            inTransit: stockByStore.inTransit || 0,
            available: stock - reserve > 0
          });
        }
      });
    }

    res.json(stockData);
  } catch (error) {
    console.error('Error fetching stock:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    handleMoySkladError(error, res);
  }
});

// Получение остатков для конкретного товара
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    console.log('Stock API request for product:', {
      productId,
      timestamp: new Date().toISOString()
    });

    // Получаем остатки по складам для конкретного товара
    const stockResponse = await moySkladClient.get('/report/stock/bystore', {
      params: {
        filter: `product=https://api.moysklad.ru/api/remap/1.2/entity/product/${productId}`
      }
    });

    if (!stockResponse.data.rows || !stockResponse.data.rows.length) {
      return res.status(404).json({ error: 'Product stock not found' });
    }

    const stockItem = stockResponse.data.rows[0];
    const stockByStore = stockItem.stockByStore?.[0] || {};
    const stock = stockByStore.stock || 0;
    const reserve = stockByStore.reserve || 0;
    
    const stockData: StockInfo & { productId: string } = {
      productId,
      stock,
      reserve,
      inTransit: stockByStore.inTransit || 0,
      available: stock - reserve > 0
    };

    res.json(stockData);
  } catch (error) {
    console.error('Error fetching product stock:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    handleMoySkladError(error, res);
  }
});

export default router; 