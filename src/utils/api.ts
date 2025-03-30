import { Product } from '@/types/product';

interface MoySkladProduct {
  id: string;
  name: string;
  salePrices?: Array<{ value: number }>;
  images?: {
    rows?: Array<{
      miniature?: {
        downloadHref?: string;
      };
    }>;
  };
  description?: string;
  productFolder?: {
    id: string;
  };
}

interface MoySkladCategory {
  id: string;
  name: string;
}

interface MoySkladResponse {
  context: {
    employee: any;
  };
  meta: {
    size: number;
    limit: number;
    offset: number;
  };
  rows: MoySkladProduct[];
}

interface ProductsResponse {
  products: Product[];
  hasMore: boolean;
  total: number;
}

export async function fetchCategories(): Promise<MoySkladCategory[]> {
  try {
    const params = {
      method: 'get',
      url: 'entity/productfolder',
      params: JSON.stringify({
        limit: 100,
        filter: 'archived=false',
        order: 'name,asc'
      })
    };

    const queryString = new URLSearchParams({
      method: params.method,
      url: params.url,
      params: params.params
    }).toString();

    const response = await fetch(`/api/moysklad?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching categories:', errorData);
      throw new Error(errorData.error || 'Не удалось загрузить категории');
    }

    const responseData = await response.json();
    
    if (!responseData.data || !responseData.data.rows) {
      throw new Error('Неверный формат ответа от сервера');
    }

    return responseData.data.rows.map((category: any) => ({
      id: category.id,
      name: category.name
    }));
  } catch (error) {
    console.error('Ошибка при загрузке категорий:', error);
    throw error instanceof Error ? error : new Error('Не удалось загрузить категории');
  }
}

export async function fetchProducts(categoryId: string, page: number = 1, limit: number = 20): Promise<ProductsResponse> {
  try {
    const offset = (page - 1) * limit;
    const params = {
      method: 'get',
      url: 'entity/product',
      params: JSON.stringify({
        limit,
        offset,
        expand: 'images,salePrices,productFolder',
        filter: `archived=false${categoryId ? `;productFolder.id=${categoryId}` : ''}`,
        order: 'name,asc'
      })
    };

    const queryString = new URLSearchParams({
      method: params.method,
      url: params.url,
      params: params.params
    }).toString();

    console.log('Fetching products:', {
      categoryId,
      page,
      limit,
      queryString
    });

    const response = await fetch(`/api/moysklad?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.error || 'Не удалось загрузить товары');
    }

    const responseData = await response.json();
    
    if (!responseData.data || !responseData.data.rows) {
      console.error('Invalid response format:', responseData);
      throw new Error('Неверный формат ответа от сервера');
    }

    const { rows, meta } = responseData.data;

    console.log('Products response:', {
      totalProducts: meta.size,
      loadedProducts: rows.length,
      page,
      hasMore: meta.size > offset + limit
    });

    const products = rows.map((product: MoySkladProduct) => ({
      id: product.id,
      name: product.name,
      price: (product.salePrices && product.salePrices[0]?.value) ? product.salePrices[0].value / 100 : 0,
      image: product.images?.rows?.[0]?.miniature?.downloadHref || '/placeholder.png',
      description: product.description || '',
      category: product.productFolder?.id || ''
    }));

    return {
      products,
      hasMore: meta.size > offset + limit,
      total: meta.size
    };
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
    throw error instanceof Error ? error : new Error('Не удалось загрузить товары');
  }
} 