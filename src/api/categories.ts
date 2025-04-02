import { MoySkladResponse, MoySkladCategory } from '@/types/product';

export interface GetCategoriesParams {
  parentId?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const categoriesApi = {
  /**
   * Получение списка категорий
   */
  async getCategories(params: GetCategoriesParams = {}): Promise<MoySkladResponse<MoySkladCategory>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.parentId) {
        queryParams.append('parentId', params.parentId);
      }

      const response = await fetch(`${API_BASE_URL}/api/categories?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Получение категории по ID
   */
  async getCategory(categoryId: string): Promise<MoySkladCategory> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }
}; 