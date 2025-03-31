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
      expand: 'images,salePrices,productFolder',
      order: 'name,asc'
    };

    if (categoryId) {
      console.log('Fetching products for category:', categoryId);
      params['filter'] = `productFolder=${categoryId}`;
      console.log('Filter params:', params);
    }

    const queryString = `method=get&url=entity/product&params=${encodeURIComponent(JSON.stringify(params))}`;
    console.log('Full request details:', {
      categoryId,
      limit,
      page,
      params,
      queryString,
      fullUrl: `/api/moysklad?${queryString}`
    });

    const response = await fetch(`/api/moysklad?${queryString}`);
    const data = await response.json();

    console.log('Raw API response:', data);

    if (!response.ok) {
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      throw new Error(data.error || 'Failed to fetch products');
    }

    if (!data.rows) {
      console.error('Invalid response structure:', data);
      throw new Error('Неверный формат ответа от сервера');
    }

    const products = data.rows;
    const total = data.meta?.size || 0;

    console.log('Products data:', {
      totalProducts: total,
      loadedProducts: products.length,
      page,
      hasMore: products.length === limit,
      firstProduct: products[0] ? {
        id: products[0].id,
        name: products[0].name,
        folder: products[0].productFolder,
        prices: products[0].salePrices,
        images: products[0].images
      } : null
    });

    const mappedProducts = products.map((product: MoySkladProduct) => {
      const mapped = {
        id: product.id,
        name: product.name,
        price: (product.salePrices && product.salePrices[0]?.value) ? product.salePrices[0].value / 100 : 0,
        image: product.images?.rows?.[0]?.miniature?.downloadHref || '/placeholder.png',
        description: product.description || '',
        categoryId: product.productFolder?.id || null
      };
      console.log('Mapped product:', {
        original: product,
        mapped
      });
      return mapped;
    });

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