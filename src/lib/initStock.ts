import { moySkladClient } from '@/api/config';
import { MoySkladStock } from '@/lib/types';
import { stockStore } from './stockStore';

/**
 * Инициализация данных об остатках
 */
export async function initStock(): Promise<void> {
  try {
    const response = await moySkladClient.get('', {
      params: {
        method: 'GET',
        url: 'report/stock/bystore',
        params: JSON.stringify({
          limit: 1000,
          offset: 0,
          expand: 'product,store',
          moment: new Date().toISOString(),
          groupBy: 'product',
          stockMode: 'all',
          store: 'all'
        })
      }
    });

    if (!response.data?.rows) {
      throw new Error('Нет данных в ответе');
    }

    // Преобразуем данные в нужный формат
    const stocks = response.data.rows.map((stock: any) => {
      // Извлекаем ID товара из URL в meta
      const productId = stock.meta?.href?.match(/\/product\/([^?]+)/)?.[1];
      
      if (!productId) {
        console.warn('Не удалось получить ID товара:', stock);
        return null;
      }

      // Получаем общее количество товара по всем складам
      let totalStock = 0;
      
      // Проверяем наличие stockByStore
      if (stock.stockByStore && Array.isArray(stock.stockByStore)) {
        totalStock = stock.stockByStore.reduce((sum: number, store: any) => {
          const quantity = typeof store.stock === 'number' ? store.stock : 0;
          return sum + quantity;
        }, 0);
      }
      
      // Создаем объект в формате, который ожидает StockStore
      return {
        quantity: totalStock,
        product: {
          id: productId,
          meta: {
            href: stock.meta.href
          }
        }
      };
    }).filter(Boolean); // Удаляем null значения

    console.log('Обработанные остатки:', stocks);
    stockStore.updateAllStock(stocks);
  } catch (error) {
    console.error('Ошибка при инициализации остатков:', error);
    throw error;
  }
} 