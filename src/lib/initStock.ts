import { moySkladClient } from '@/api/config';
import { StockData } from '@/types/stock';

/**
 * Инициализация данных об остатках
 */
export async function initStock(): Promise<StockData[]> {
  try {
    const response = await moySkladClient.get('report/stock/bystore', {
      params: {
        limit: 100,
        offset: 0,
        expand: 'product,store',
        moment: new Date().toISOString(),
        groupBy: 'product',
        stockMode: 'all',
        store: 'all',
        filter: 'stockMode=all',
        order: 'name,asc'
      }
    });

    if (!response.data) {
      console.warn('Пустой ответ от API МойСклад');
      return [];
    }

    // Проверяем, что response.data является массивом
    const data = Array.isArray(response.data) ? response.data : [response.data];
    
    return data.map((item: any) => ({
      id: item.product?.id || '',
      name: item.product?.name || 'Неизвестный товар',
      quantity: Number(item.quantity) || 0,
      price: Number(item.price) || 0,
      store: item.store?.name || 'Неизвестный склад',
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Ошибка при инициализации остатков:', error);
    return [];
  }
} 