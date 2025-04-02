import { moySkladClient } from '../client';
import { MoySkladParams, MOYSKLAD_CONFIG } from '../config';
import { MoySkladProduct, MoySkladResponse } from '@/types/product';

export interface GetProductsParams extends MoySkladParams {
  categoryId?: string;
  searchQuery?: string;
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

    return moySkladClient.get<MoySkladResponse<MoySkladProduct>>('entity/product', queryParams);
  },

  async getProductById(id: string): Promise<MoySkladProduct> {
    const queryParams = {
      ...MOYSKLAD_CONFIG.defaultProductParams
    };

    return moySkladClient.get<MoySkladProduct>(`entity/product/${id}`, queryParams);
  },

  async getProductStock(id: string): Promise<number> {
    const response = await moySkladClient.get<any>('report/stock/bystore', {
      filter: `product.id=${id}`
    });
    
    return response.rows?.reduce((sum: number, row: any) => {
      return sum + (row.stock || 0);
    }, 0) || 0;
  }
}; 