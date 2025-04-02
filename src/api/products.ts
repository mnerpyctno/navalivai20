import { MoySkladResponse, MoySkladProduct } from '@/types/product';

export interface GetProductsParams {
  categoryId?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const productsApi = {
  /**
   * Получение списка товаров
   */
  async getProducts(params: GetProductsParams = {}): Promise<MoySkladResponse<MoySkladProduct>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.categoryId) {
        queryParams.append('categoryId', params.categoryId);
      }
      if (params.searchQuery) {
        queryParams.append('searchQuery', params.searchQuery);
      }
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params.offset) {
        queryParams.append('offset', params.offset.toString());
      }

      const response = await fetch(`${API_BASE_URL}/api/products?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Получение товара по ID
   */
  async getProduct(productId: string): Promise<MoySkladProduct> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
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