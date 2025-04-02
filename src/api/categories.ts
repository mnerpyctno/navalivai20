import { moySkladClient, MoySkladParams, DEFAULT_PARAMS } from '@/config/moysklad';
import { handleMoySkladError } from '@/lib/errors';
import { MoySkladResponse, MoySkladCategory } from '@/types/product';

export interface GetCategoriesParams extends MoySkladParams {
  parentId?: string;
}

export const categoriesApi = {
  /**
   * Получение списка категорий
   */
  async getCategories(params: GetCategoriesParams = {}): Promise<MoySkladResponse<MoySkladCategory>> {
    try {
      const queryParams = {
        ...DEFAULT_PARAMS,
        ...params
      };

      // Добавляем фильтр по родительской категории
      if (params.parentId) {
        queryParams.filter = `${queryParams.filter};productFolder=${params.parentId}`;
      }

      const response = await moySkladClient.get('', {
        params: {
          method: 'get',
          url: 'entity/productfolder',
          params: JSON.stringify(queryParams)
        }
      });

      return response.data;
    } catch (error) {
      handleMoySkladError(error);
    }
  },

  /**
   * Получение категории по ID
   */
  async getCategory(categoryId: string): Promise<MoySkladCategory> {
    try {
      const response = await moySkladClient.get('', {
        params: {
          method: 'get',
          url: `entity/productfolder/${categoryId}`,
          params: JSON.stringify({})
        }
      });
      return response.data;
    } catch (error) {
      handleMoySkladError(error);
    }
  }
}; 