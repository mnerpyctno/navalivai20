import { moySkladClient } from '../client';
import { MOYSKLAD_CONFIG } from '../config';
import { MoySkladProduct, MoySkladResponse } from '../types';
import { AxiosResponse } from 'axios';

export interface GetProductsParams {
  categoryId?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export const productsApi = {
  async getProducts(params: GetProductsParams): Promise<MoySkladResponse<MoySkladProduct>> {
    const filters = ['archived=false'];
    
    if (params.categoryId) {
      filters.push(`productFolder=${params.categoryId}`);
    }
    
    if (params.searchQuery) {
      filters.push(`name~=${params.searchQuery}`);
    }

    const queryParams = {
      ...MOYSKLAD_CONFIG.defaultProductParams,
      ...params,
      filter: filters.join(';')
    };

    const response = await moySkladClient.get<MoySkladResponse<MoySkladProduct>>('/entity/product', queryParams);
    return response.data;
  },

  async getProductById(id: string): Promise<MoySkladProduct> {
    const queryParams = {
      ...MOYSKLAD_CONFIG.defaultProductParams
    };

    const response = await moySkladClient.get<MoySkladProduct>(`/entity/product/${id}`, queryParams);
    return response.data;
  }
}; 