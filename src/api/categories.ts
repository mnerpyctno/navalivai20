import { moySkladClient } from './config';

export interface MoySkladCategory {
  id: string;
  name: string;
  code?: string;
  description?: string;
  externalCode?: string;
  meta: {
    href: string;
    type: string;
    mediaType: string;
  };
}

export interface MoySkladResponse<T> {
  rows: T[];
  meta: {
    href: string;
    type: string;
    mediaType: string;
    size: number;
    limit: number;
    offset: number;
  };
}

export const categoriesApi = {
  /**
   * Получение списка категорий
   */
  async getCategories(params: { 
    limit?: number; 
    offset?: number; 
    order?: string;
    filter?: string;
  } = {}): Promise<MoySkladResponse<MoySkladCategory>> {
    const defaultParams = {
      limit: 100,
      offset: 0,
      order: 'name,asc',
      ...params
    };

    const response = await moySkladClient.get('', {
      params: {
        method: 'get',
        url: 'entity/productfolder',
        params: JSON.stringify(defaultParams)
      }
    });
    return response.data;
  },

  /**
   * Получение категории по ID
   */
  async getCategory(categoryId: string): Promise<MoySkladCategory> {
    const response = await moySkladClient.get('', {
      params: {
        method: 'get',
        url: `entity/productfolder/${categoryId}`,
        params: JSON.stringify({})
      }
    });
    return response.data;
  }
}; 