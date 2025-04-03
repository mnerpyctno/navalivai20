import { MoySkladResponse, MoySkladProduct } from '@/types/product';

export interface GetProductsParams {
  categoryId?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface ProductImage {
  id: string;
  title: string;
  miniature: string;
  tiny: string;
  full: string;
}

export interface MoySkladStock {
  rows: Array<{
    quantity: number;
    product: {
      id: string;
      name: string;
    };
    store: {
      id: string;
      name: string;
    };
  }>;
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
  },

  /**
   * Получение изображений товара
   */
  async getProductImages(productId: string): Promise<ProductImage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/images`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      if (data.length === 0) {
        return [];
      }
      
      const validImages = data.filter(image => {
        const isValid = image && 
          (image.miniature || image.tiny || image.full) && 
          (typeof image.miniature === 'string' || typeof image.tiny === 'string' || typeof image.full === 'string');
        
        if (!isValid) {
          console.error('Invalid image data:', { image });
        }
        return isValid;
      });
      
      if (validImages.length === 0) {
        return [];
      }
      
      return validImages.map(image => ({
        id: image.id || productId,
        title: image.title || '',
        miniature: image.miniature || `/api/images/${productId}?miniature=true`,
        tiny: image.tiny || `/api/images/${productId}?miniature=true`,
        full: image.full || `/api/images/${productId}`
      }));
    } catch (error) {
      console.error('Error fetching product images:', error);
      return [];
    }
  },

  /**
   * Получение остатков товара
   */
  async getStock(productId: string): Promise<MoySkladStock> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/stock`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching product stock:', error);
      throw error;
    }
  }
}; 