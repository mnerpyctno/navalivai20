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
    const defaultParams = {
      limit: 20,
      offset: 0,
      expand: 'images,salePrices,productFolder,images.rows',
      order: 'name,asc',
      ...params
    };

    if (params.categoryId) {
      defaultParams.filter = defaultParams.filter 
        ? `${defaultParams.filter};productFolder=${params.categoryId}`
        : `productFolder=${params.categoryId}`;
    }

    console.log('Products API request params:', defaultParams);

    const response = await moySkladClient.get('', {
      params: {
        method: 'get',
        url: 'entity/product',
        params: JSON.stringify(defaultParams)
      }
    });

    console.log('Products API response:', {
      total: response.data.meta?.size,
      products: response.data.rows?.map((p: MoySkladProduct) => ({
        id: p.id,
        name: p.name,
        hasImages: !!p.images,
        imagesMeta: p.images?.meta,
        imagesRows: p.images?.rows?.length,
        firstImage: p.images?.rows?.[0],
        firstImageMiniature: p.images?.rows?.[0]?.miniature
      }))
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