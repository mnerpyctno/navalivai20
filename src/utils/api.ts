import { Product } from '@/types/product';

interface ProductsResponse {
  products: Product[];
  hasMore: boolean;
  total: number;
}

export async function fetchProducts(categoryId: string, page: number = 1, limit: number = 20): Promise<ProductsResponse> {
  try {
    const response = await fetch(`/api/products?category=${categoryId}&page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Не удалось загрузить товары');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
    throw new Error('Не удалось загрузить товары');
  }
} 