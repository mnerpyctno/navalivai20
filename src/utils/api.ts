import { Product } from '@/types/product';

export async function fetchProducts(categoryId: string): Promise<Product[]> {
  try {
    const response = await fetch(`/api/products?category=${categoryId}`);
    if (!response.ok) {
      throw new Error('Не удалось загрузить товары');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
    throw new Error('Не удалось загрузить товары');
  }
} 