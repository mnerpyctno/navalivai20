import { MoySkladResponse, MoySkladStock } from '@/lib/types';
import { stockStore } from '@/lib/stockStore';

export const stockApi = {
  /**
   * Получение остатков по товарам
   */
  async getStock(params: {
    limit?: number;
    offset?: number;
    productId?: string;
    expand?: string;
    moment?: string;
    groupBy?: string;
    stockMode?: string;
    store?: string;
  } = {}): Promise<MoySkladResponse<MoySkladStock>> {
    if (!stockStore.isDataInitialized()) {
      throw new Error('Stock data not initialized. Waiting for webhook data.');
    }

    if (params.productId) {
      const quantity = stockStore.getStock(params.productId);
      if (quantity === undefined) {
        return {
          rows: [],
          meta: {
            href: '/report/stock/bystore',
            type: 'reportstockbystore',
            mediaType: 'application/json',
            size: 0,
            limit: 1000,
            offset: 0
          }
        };
      }

      return {
        rows: [{
          quantity,
          product: { meta: { href: `/product/${params.productId}` } },
          store: { meta: { href: '/store/main' } }
        }],
        meta: {
          href: '/report/stock/bystore',
          type: 'reportstockbystore',
          mediaType: 'application/json',
          size: 1,
          limit: 1000,
          offset: 0
        }
      };
    }

    // Если не указан productId, возвращаем все остатки
    return {
      rows: Array.from(stockStore.getAllStock().entries()).map(([productId, quantity]) => ({
        quantity,
        product: { meta: { href: `/product/${productId}` } },
        store: { meta: { href: '/store/main' } }
      })),
      meta: {
        href: '/report/stock/bystore',
        type: 'reportstockbystore',
        mediaType: 'application/json',
        size: stockStore.getAllStock().size,
        limit: 1000,
        offset: 0
      }
    };
  },

  /**
   * Получение остатков по конкретному товару
   */
  async getProductStock(productId: string): Promise<MoySkladResponse<MoySkladStock>> {
    if (!stockStore.isDataInitialized()) {
      throw new Error('Stock data not initialized. Waiting for webhook data.');
    }

    const quantity = stockStore.getStock(productId);
    if (quantity === undefined) {
      return {
        rows: [],
        meta: {
          href: '/report/stock/bystore',
          type: 'reportstockbystore',
          mediaType: 'application/json',
          size: 0,
          limit: 1000,
          offset: 0
        }
      };
    }

    return {
      rows: [{
        quantity,
        product: { meta: { href: `/product/${productId}` } },
        store: { meta: { href: '/store/main' } }
      }],
      meta: {
        href: '/report/stock/bystore',
        type: 'reportstockbystore',
        mediaType: 'application/json',
        size: 1,
        limit: 1000,
        offset: 0
      }
    };
  },

  /**
   * Получение остатков по всем товарам
   */
  async getAllStock(): Promise<MoySkladResponse<MoySkladStock>> {
    if (!stockStore.isDataInitialized()) {
      throw new Error('Stock data not initialized. Waiting for webhook data.');
    }

    return {
      rows: Array.from(stockStore.getAllStock().entries()).map(([productId, quantity]) => ({
        quantity,
        product: { meta: { href: `/product/${productId}` } },
        store: { meta: { href: '/store/main' } }
      })),
      meta: {
        href: '/report/stock/bystore',
        type: 'reportstockbystore',
        mediaType: 'application/json',
        size: stockStore.getAllStock().size,
        limit: 1000,
        offset: 0
      }
    };
  }
}; 