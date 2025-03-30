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
      limit: 100,
      offset: 0,
      order: 'name,asc'
    };

    const queryString = `method=get&url=entity/productfolder&params=${encodeURIComponent(JSON.stringify(params))}`;
    console.log('Fetching categories:', {
      params,
      queryString
    });

    const response = await fetch(`/api/moysklad?${queryString}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('Error fetching categories:', data);
      throw new Error(data.error || 'Не удалось загрузить категории');
    }

    if (!data.rows) {
      throw new Error('Неверный формат ответа от сервера');
    }

    return data.rows.map((category: any) => ({
      id: category.id,
      name: category.name
    }));
  } catch (error) {
    console.error('Ошибка при загрузке категорий:', error);
    throw error instanceof Error ? error : new Error('Не удалось загрузить категории');
  }
}

export async function fetchProducts(categoryId?: string, page: number = 1, limit: number = 20): Promise<ProductsResponse> {
  try {
    const params: Record<string, any> = {
      limit,
      offset: (page - 1) * limit,
      expand: 'images,salePrices',
      order: 'name,asc'
    };

    if (categoryId) {
      params['filter'] = `productFolder=${categoryId}`;
    }

    const queryString = `method=get&url=entity/product&params=${encodeURIComponent(JSON.stringify(params))}`;
    console.log('Fetching products:', {
      categoryId,
      limit,
      page,
      params
    });
    console.log('Query string:', queryString);

    const response = await fetch(`/api/moysklad?${queryString}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('Error response:', data);
      throw new Error(data.error || 'Failed to fetch products');
    }

    if (!data.rows) {
      throw new Error('Неверный формат ответа от сервера');
    }

    const products = data.rows;
    const total = data.meta?.size || 0;

    console.log('Products response:', {
      totalProducts: total,
      loadedProducts: products.length,
      page,
      hasMore: products.length === limit
    });

    const mappedProducts = products.map((product: MoySkladProduct) => ({
      id: product.id,
      name: product.name,
      price: (product.salePrices && product.salePrices[0]?.value) ? product.salePrices[0].value / 100 : 0,
      image: product.images?.rows?.[0]?.miniature?.downloadHref || '/placeholder.png',
      description: product.description || '',
      category: product.productFolder?.id || ''
    }));

    return {
      products: mappedProducts,
      total,
      hasMore: products.length === limit
    };
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
    throw error;
  }
} 