import { Product, MoySkladProduct, MoySkladCategory, MoySkladResponse, ProductsResponse } from '@/types/product';
import { categoriesApi, productsApi, stockApi } from '@/api';
import { getProductImageUrl } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const fetchCategories = async (): Promise<MoySkladCategory[]> => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) {
      throw new Error('Ошибка при загрузке категорий');
    }
    return await response.json();
  } catch (error) {
    throw new Error('Ошибка при загрузке категорий');
  }
};

export const fetchProductStock = async (productId: string): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/products/${productId}/stock`);
    if (!response.ok) {
      throw new Error('Ошибка при получении остатка');
    }
    const data = await response.json();
    return data.stock;
  } catch (error) {
    throw new Error('Ошибка при получении остатка');
  }
};

export async function fetchProducts(
  categoryId?: string,
  page: number = 1,
  limit: number = 9,
  searchQuery?: string
): Promise<ProductsResponse> {
  try {
    const params = {
      limit,
      offset: (page - 1) * limit,
      categoryId,
      expand: 'images,salePrices,productFolder,images.rows',
      order: 'name,asc',
      filter: 'archived=false'
    };

    if (searchQuery) {
      params.filter = `${params.filter};name~=${searchQuery}`;
    }

    if (categoryId) {
      params.filter = `${params.filter};productFolder=${categoryId}`;
    }

    const response = await productsApi.getProducts(params);

    const products = response.rows;
    const total = response.meta?.size || 0;

    // Проверяем остатки в МойСклад для каждого товара
    const productsWithStock = await Promise.all(
      products.map(async (product: MoySkladProduct) => {
        try {
          const stockResponse = await stockApi.getProductStock(product.id);
          
          if (stockResponse.rows && stockResponse.rows.length > 0) {
            const totalQuantity = stockResponse.rows.reduce((sum: number, row: any) => {
              const quantity = typeof row.quantity === 'number' ? row.quantity : 0;
              return sum + quantity;
            }, 0);
            
            const imageUrl = getProductImageUrl(product);
            
            return {
              id: product.id,
              name: product.name,
              price: product.salePrices?.[0]?.value ? product.salePrices[0].value / 100 : 0,
              image: imageUrl,
              description: product.description || '',
              categoryId: product.productFolder?.meta?.href?.split('/').pop() || '',
              available: totalQuantity > 0,
              stock: totalQuantity
            };
          }
          
          const imageUrl = getProductImageUrl(product);
          
          return {
            id: product.id,
            name: product.name,
            price: product.salePrices?.[0]?.value ? product.salePrices[0].value / 100 : 0,
            image: imageUrl,
            description: product.description || '',
            categoryId: product.productFolder?.meta?.href?.split('/').pop() || '',
            available: false,
            stock: 0
          };
        } catch (error) {
          const imageUrl = getProductImageUrl(product);
          
          return {
            id: product.id,
            name: product.name,
            price: product.salePrices?.[0]?.value ? product.salePrices[0].value / 100 : 0,
            image: imageUrl,
            description: product.description || '',
            categoryId: product.productFolder?.meta?.href?.split('/').pop() || '',
            available: false,
            stock: 0
          };
        }
      })
    );

    return {
      products: productsWithStock,
      total,
      hasMore: (page * limit) < total
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Не удалось загрузить товары');
  }
} 