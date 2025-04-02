import { moySkladClient, MoySkladParams, DEFAULT_PARAMS } from '@/config/moysklad';
import { handleMoySkladError } from '@/lib/errors';
import { MoySkladResponse, MoySkladProduct } from '@/types/product';

export interface GetProductsParams extends MoySkladParams {
  categoryId?: string;
  searchQuery?: string;
}

export const productsApi = {
  /**
   * Получение списка товаров
   */
  async getProducts(params: GetProductsParams = {}): Promise<MoySkladResponse<MoySkladProduct>> {
    try {
      const queryParams = {
        ...DEFAULT_PARAMS,
        ...params
      };

      // Добавляем фильтр по категории
      if (params.categoryId) {
        queryParams.filter = `${queryParams.filter};productFolder=${params.categoryId}`;
      }

      // Добавляем поисковый запрос
      if (params.searchQuery) {
        queryParams.filter = `${queryParams.filter};name~=${params.searchQuery}`;
      }

      const response = await moySkladClient.get('', {
        params: {
          method: 'get',
          url: 'entity/product',
          params: JSON.stringify(queryParams)
        }
      });

      return response.data;
    } catch (error) {
      handleMoySkladError(error);
    }
  },

  /**
   * Получение товара по ID
   */
  async getProduct(productId: string): Promise<MoySkladProduct> {
    try {
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
    } catch (error) {
      handleMoySkladError(error);
    }
  },

  /**
   * Поиск товаров
   */
  async searchProducts(query: string, params: GetProductsParams = {}): Promise<MoySkladResponse<MoySkladProduct>> {
    return this.getProducts({
      ...params,
      searchQuery: query
    });
  }
}; 