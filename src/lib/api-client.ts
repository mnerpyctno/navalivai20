import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api';
import { handleMoySkladError } from '@/lib/errorHandler';
import { MoySkladProduct, MoySkladResponse, ProductsResponse, MoySkladCategory } from '@/types/product';
import { env } from '@/config/env';
import { getCachedData, cacheData } from '@/lib/cache';

// Создаем базовый API клиент для работы с нашими API Routes
export const api = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Функция для добавления задержки между запросами
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Максимальное количество записей, которое можно получить за один запрос
const MAX_LIMIT = 10000;

// Добавляем интерцептор для логирования запросов
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        params: config.params
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем интерцептор для обработки ответов
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);

export const fetchCategories = async (): Promise<MoySkladCategory[]> => {
  try {
    const response = await api.get('/moysklad/entity/productfolder', {
      params: {
        limit: 100,
        filter: 'archived=false',
        expand: 'productFolder'
      }
    });
    return response.data.rows || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Ошибка при получении категорий');
  }
};

export const fetchProductStock = async (productId: string): Promise<number> => {
  try {
    const response = await api.get('/moysklad/report/stock/bystore', {
      params: {
        filter: `product.id=${productId}`,
        limit: 10000, // Увеличиваем лимит
        expand: 'product',
        moment: new Date().toISOString(),
        groupBy: 'product',
        store: 'all',
        order: 'product'
      }
    });
    
    if (!response.data.rows || response.data.rows.length === 0) {
      console.warn(`No stock data found for product ${productId}`);
      return 0;
    }
    
    return response.data.rows[0].quantity || 0;
  } catch (error) {
    console.error('Error fetching product stock:', error);
    return 0;
  }
};

// Вспомогательная функция для получения URL изображения
const getImageUrl = (imageUrl: string, useOriginal: boolean = false): string => {
  if (!imageUrl) return '';
  
  try {
    // Если URL уже содержит параметр miniature=true, удаляем его
    if (imageUrl.includes('miniature=true')) {
      const url = new URL(imageUrl);
      url.searchParams.delete('miniature');
      imageUrl = url.toString();
    }
    
    // Если нужно миниатюру, добавляем параметр
    if (!useOriginal) {
      const url = new URL(imageUrl);
      url.searchParams.set('miniature', 'true');
      imageUrl = url.toString();
    }

    // Используем moysklad/image вместо image-proxy
    return `/image?url=${encodeURIComponent(imageUrl)}`;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return '';
  }
};

export async function fetchProducts(
  categoryId?: string,
  page: number = 1,
  limit: number = 10000,
  searchQuery?: string
): Promise<ProductsResponse> {
  try {
    const cacheKey = `products:${categoryId || 'all'}:${page}:${limit}`;
    const cachedData = await getCachedData<ProductsResponse>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    let allProducts: MoySkladProduct[] = [];
    let offset = 0;
    let hasMore = true;
    let totalRequests = 0;
    const batchSize = Math.min(limit, 100); // Ограничиваем размер пакета
    let lastResponse: any = null;

    while (hasMore && totalRequests < 5) { // Ограничиваем количество запросов
      totalRequests++;
      const params = {
        limit: batchSize,
        offset,
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

      lastResponse = await api.get('/moysklad/entity/product', { params });
      
      const products = lastResponse.data.rows || [];
      allProducts = [...allProducts, ...products];
      
      hasMore = products.length === batchSize;
      offset += batchSize;

      if (allProducts.length >= limit) {
        allProducts = allProducts.slice(0, limit);
        hasMore = false;
      }
    }

    if (!lastResponse) {
      throw new Error('Не удалось получить данные от сервера');
    }

    const transformedProducts = allProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: product.salePrices?.[0]?.value ? product.salePrices[0].value / 100 : 0,
      image: product.images?.rows?.[0]?.miniature?.href || '/default-product.jpg',
      description: product.description || '',
      categoryId: product.productFolder?.meta?.href?.split('/').pop() || '',
      available: true,
      stock: 0
    }));

    const result: ProductsResponse = {
      products: transformedProducts,
      total: lastResponse.data.meta?.size || transformedProducts.length,
      hasMore
    };

    await cacheData(cacheKey, result, 5); // Кэшируем на 5 минут
    return result;

  } catch (error) {
    throw error instanceof Error ? error : new Error('Не удалось загрузить товары');
  }
} 