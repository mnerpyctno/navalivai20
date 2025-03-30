import { Product } from '@/types/product';

interface MoySkladResponse {
  context: {
    employee: any;
  };
  meta: {
    size: number;
    limit: number;
    offset: number;
  };
  rows: any[];
}

interface ProductsResponse {
  products: Product[];
  hasMore: boolean;
  total: number;
}

export async function fetchProducts(categoryId: string, page: number = 1, limit: number = 20): Promise<ProductsResponse> {
  try {
    const offset = (page - 1) * limit;
    const response = await fetch('/api/moysklad', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'get',
        url: 'entity/product',
        params: JSON.stringify({
          limit,
          offset,
          expand: 'images,salePrices,productFolder',
          filter: `archived=false${categoryId ? `;productFolder.id=${categoryId}` : ''}`
        })
      })
    });

    if (!response.ok) {
      throw new Error('Не удалось загрузить товары');
    }

    const data: { data: MoySkladResponse } = await response.json();
    const { rows, meta } = data.data;

    const products = rows.map(product => ({
      id: product.id,
      name: product.name,
      price: product.salePrices?.[0]?.value / 100 || 0,
      image: product.images?.rows?.[0]?.miniature?.downloadHref,
      description: product.description,
      category: product.productFolder?.id
    }));

    return {
      products,
      hasMore: meta.size > offset + limit,
      total: meta.size
    };
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
    throw new Error('Не удалось загрузить товары');
  }
} 