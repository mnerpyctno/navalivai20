import { MoySkladResponse, MoySkladCategory } from '@/types/product';

export interface GetCategoriesParams {
  parentId?: string;
}

// Определяем базовый URL API в зависимости от окружения
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Серверная сторона
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  }
  
  // Клиентская сторона
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment 
    ? 'http://localhost:3002'
    : ''; // В продакшене используем относительный путь, так как API находится в том же домене
};

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

      const response = await fetch(`${getApiBaseUrl()}/api/categories?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
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
      const response = await fetch(`${getApiBaseUrl()}/api/categories/${categoryId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
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