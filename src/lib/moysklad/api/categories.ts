import { MoySkladParams } from '../config';
import { MoySkladCategory, MoySkladResponse } from '@/types/product';

export interface GetCategoriesParams extends MoySkladParams {
  parentId?: string;
}

export const categoriesApi = {
  async getCategories(params?: GetCategoriesParams): Promise<MoySkladResponse<MoySkladCategory>> {
    const filter = ['archived=false'];
    
    if (params?.parentId) {
      filter.push(`productFolder=${params.parentId}`);
    }

    const response = await fetch('/api/moysklad/productfolder', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        filter: filter.join(';')
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  },

  async getCategoryById(id: string): Promise<MoySkladCategory> {
    const response = await fetch(`/api/moysklad/productfolder/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch category');
    }

    return response.json();
  }
}; 