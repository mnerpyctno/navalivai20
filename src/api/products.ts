import { moySkladClient } from './config';
import { MoySkladResponse } from './categories';

export interface MoySkladProduct {
  id: string;
  name: string;
  description?: string;
  code?: string;
  images?: {
    meta: {
      href: string;
      type: string;
      mediaType: string;
      size: number;
      limit: number;
      offset: number;
    };
    rows: Array<{
      meta: {
        href: string;
        type: string;
        mediaType: string;
      };
      title: string;
      filename: string;
      size: number;
      updated: string;
      miniature: {
        href: string;
        type: string;
        mediaType: string;
        downloadHref?: string;
      };
    }>;
  };
  salePrices?: Array<{
    value: number;
    currency?: {
      name: string;
      code: string;
    };
  }>;
  minPrice?: {
    value: number;
  };
  productFolder?: {
    meta: {
      href: string;
    };
  };
  archived?: boolean;
}

export interface MoySkladProductImage {
  meta: {
    href: string;
    type: string;
    mediaType: string;
    size: number;
    limit: number;
    offset: number;
  };
  rows: Array<{
    meta: {
      href: string;
      type: string;
      mediaType: string;
      size: number;
    };
    miniature: {
      href: string;
      downloadHref: string;
    };
  }>;
}

export const productsApi = {
  /**
   * Получение списка товаров
   */
  async getProducts(params: {
    limit?: number;
    offset?: number;
    categoryId?: string;
    order?: string;
    filter?: string;
    expand?: string;
  } = {}): Promise<MoySkladResponse<MoySkladProduct>> {
    const defaultParams: Record<string, any> = {
      limit: params.limit || 20,
      offset: params.offset || 0,
      order: params.order || 'name,asc',
      filter: params.filter || 'archived=false',
      expand: params.expand || 'images'
    };

    if (params.categoryId) {
      defaultParams.filter = defaultParams.filter
        ? `${defaultParams.filter};${params.categoryId}`
        : `productFolder=${params.categoryId}`;
    }

    const response = await moySkladClient.get('', {
      params: {
        method: 'get',
        url: 'entity/product',
        params: JSON.stringify(defaultParams)
      }
    });

    return response.data;
  },

  /**
   * Получение товара по ID
   */
  async getProduct(productId: string): Promise<MoySkladProduct> {
    const response = await moySkladClient.get('', {
      params: {
        method: 'get',
        url: `entity/product/${productId}`,
        params: JSON.stringify({
          expand: 'images,salePrices,productFolder,images.rows'
        })
      }
    });
    return response.data;
  }
}; 