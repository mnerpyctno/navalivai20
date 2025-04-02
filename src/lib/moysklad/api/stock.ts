import { moyskladClient } from '../client';
import { MoySkladParams } from '../config';

export interface StockReport {
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
}

export interface GetStockParams extends MoySkladParams {
  productId?: string;
  storeId?: string;
  moment?: string;
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
  async getStock(params: GetStockParams): Promise<StockReport[]> {
    try {
      const queryParams: StockQueryParams = {
        moment: params.moment || new Date().toISOString(),
        groupBy: 'product',
        store: 'all',
        stockMode: 'all',
        limit: 10000,
        expand: 'product,store',
        order: 'name,asc'
      };

      // Если указан productId, используем фильтр по имени товара
      if (params.productId) {
        queryParams.filter = `product.name~=${params.productId}`;
      }

      const response = await moyskladClient.get<MoySkladResponse>('report/stock/bystore', queryParams);

      if (!response.data || !Array.isArray(response.data.rows)) {
        console.warn('Invalid response format from MoySklad API');
        return [];
      }

      return response.data.rows.map((row) => ({
        stock: row.stock || 0,
        reserve: row.reserve || 0,
        inTransit: row.inTransit || 0,
        quantity: row.quantity || 0,
        product: row.product,
        store: row.store
      }));
    } catch (error: any) {
      console.error('Error fetching stock:', error);
      if (error.response?.status === 412) {
        console.warn('Precondition Failed: Invalid filter parameters', error.response.data);
      }
      return [];
    }
  },

  async getProductStock(productId: string): Promise<number> {
    try {
      const stocks = await this.getStock({ productId });
      return stocks.reduce((total, item) => total + item.stock, 0);
    } catch (error) {
      console.error('Error fetching product stock:', error);
      return 0;
    }
  }
}; 