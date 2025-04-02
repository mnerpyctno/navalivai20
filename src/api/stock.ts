import moySkladClient from './config';
import { StockData } from '@/types/stock';

interface GetStockParams {
  limit?: number;
  offset?: number;
  expand?: string;
  moment?: string;
  groupBy?: string;
  stockMode?: string;
  store?: string;
  filter?: string;
  order?: string;
  productId?: string;
}

interface StockQueryParams {
  moment: string;
  groupBy: string;
  store: string;
  stockMode: string;
  limit: number;
  expand: string;
  order: string;
  filter?: string;
}

interface MoySkladResponse {
  rows: Array<{
    stock: number;
    reserve: number;
    inTransit: number;
    quantity: number;
    product?: {
      id: string;
      name: string;
    };
    store?: {
      id: string;
      name: string;
    };
  }>;
}

export const stockApi = {
  async getStock(params: GetStockParams = {}): Promise<StockData[]> {
    try {
      const queryParams: StockQueryParams = {
        moment: params.moment || new Date().toISOString(),
        groupBy: 'product',
        store: 'all',
        stockMode: 'all',
        limit: params.limit || 100,
        expand: params.expand || 'product,store',
        order: params.order || 'name,asc'
      };

      // Если указан productId, используем фильтр по имени товара
      if (params.productId) {
        queryParams.filter = `product.name~=${params.productId}`;
      }

      const response = await moySkladClient.get<MoySkladResponse>('report/stock/bystore', { params: queryParams });

      if (!response.data || !Array.isArray(response.data.rows)) {
        console.warn('Invalid response format from MoySklad API');
        return [];
      }

      return response.data.rows.map((row) => ({
        id: row.product?.id || '',
        name: row.product?.name || 'Unknown Product',
        quantity: row.quantity || 0,
        price: 0, // Цена не возвращается в отчете об остатках
        store: row.store?.name || 'Unknown Store',
        updatedAt: new Date().toISOString()
      }));
    } catch (error: any) {
      console.error('Error fetching stock:', error);
      if (error.response?.status === 412) {
        console.warn('Precondition Failed: Invalid filter parameters', error.response.data);
      }
      return [];
    }
  },

  /**
   * Получение остатков по конкретному товару
   */
  async getProductStock(productId: string): Promise<StockData[]> {
    return this.getStock({ productId });
  },

  /**
   * Получение всех остатков
   */
  async getAllStock(): Promise<StockData[]> {
    return this.getStock();
  }
}; 