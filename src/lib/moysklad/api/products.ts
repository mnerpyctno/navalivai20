import { moySkladClient } from '../client';
import { MOYSKLAD_CONFIG } from '../../../server/src/config/moysklad';
import { MoySkladProduct, MoySkladResponse } from '../types';

export interface GetProductsParams {
  categoryId?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
  filter?: string; // Added the missing filter property
}

export const productsApi = {
  async getProducts(params: GetProductsParams): Promise<MoySkladResponse<MoySkladProduct>> {
    const queryParams = {
      filter: params.filter || '',
      categoryId: params.categoryId,
      searchQuery: params.searchQuery,
      limit: params.limit,
      offset: params.offset,
      expand: 'images,salePrices,productFolder,images.rows',
      order: 'name,asc',
    };

    const response = await moySkladClient.get<MoySkladResponse<MoySkladProduct>>('/entity/product', {
      params: queryParams, // Передаем параметры в свойство `params`
    });
    return response.data;
  },

  async getProductById(id: string): Promise<MoySkladProduct> {
    const queryParams = {
      ...MOYSKLAD_CONFIG.defaultProductParams
    };

    const response = await moySkladClient.get<MoySkladProduct>(`/entity/product/${id}`, {
      params: queryParams, // Передаем параметры в свойство `params`
    });
    return response.data;
  }
};