import { 
  Product, 
  Category, 
  MoySkladResponse, 
  MoySkladProduct, 
  MoySkladCategory,
  MoySkladStock,
  MoySkladOrder
} from '@/types/product';
import { cache, CACHE_KEYS } from './cache';
import { env } from '@/config/env';
import axios from 'axios';
import { ProductsResponse } from '@/types/product';
import { CACHE_TTL } from '@/config/constants';
import { InternalAxiosRequestConfig } from 'axios';

// Экспортируем типы
export type { Product, Category };

// Создаем базовый API клиент для работы с MoySklad API через прокси
const moySkladApi = axios.create({
  baseURL: `${env.apiUrl}/proxy`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json;charset=utf-8'
  },
  withCredentials: true
});

// Добавляем интерцептор для логирования запросов
moySkladApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.method) {
      config.method = 'get';
    }
    console.log('Making request to MoySklad API:', {
      url: config.url,
      method: config.method,
      params: config.params,
      timestamp: new Date().toISOString()
    });
    return config;
  },
  (error: Error) => {
    console.error('Ошибка при отправке запроса:', error);
    return Promise.reject(error);
  }
);

// Добавляем интерцептор для обработки ответов
moySkladApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: any) => {
    console.error('Ошибка ответа:', {
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        headers: error.config?.headers
      }
    });
    return Promise.reject(error);
  }
);

// API для работы с продуктами
export const productsApi = {
  async getProducts(params: { limit?: number; offset?: number; categoryId?: string; searchQuery?: string } = {}): Promise<MoySkladResponse<MoySkladProduct>> {
    const cacheKey = CACHE_KEYS.PRODUCTS(params.categoryId, Math.floor((params.offset || 0) / (params.limit || 9)) + 1, params.limit || 9);
    const cachedData = cache.get<MoySkladResponse<MoySkladProduct>>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const response = await moySkladApi.get('', { 
      params: {
        method: 'get',
        url: '/entity/product',
        params: JSON.stringify({
          ...params,
          expand: 'images,salePrices,productFolder,images.rows',
          filter: 'archived=false',
          order: 'name,asc',
          limit: params.limit || 100,
          offset: params.offset || 0
        })
      }
    });
    
    const data = response.data;
    cache.set(cacheKey, data, CACHE_TTL.products);
    return data;
  },

  async getProductById(id: string): Promise<MoySkladProduct> {
    const cacheKey = CACHE_KEYS.PRODUCT(id);
    const cachedData = cache.get<MoySkladProduct>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const response = await moySkladApi.get('', {
      params: {
        method: 'get',
        url: `/entity/product/${id}`
      }
    });
    const data = response.data;
    cache.set(cacheKey, data, CACHE_TTL.products);
    return data;
  },

  async getProductStock(productId: string): Promise<MoySkladResponse<any>> {
    const cacheKey = CACHE_KEYS.STOCK(productId);
    const cachedData = cache.get<MoySkladResponse<any>>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const response = await moySkladApi.get('', {
      params: {
        method: 'get',
        url: '/report/stock/all',
        params: JSON.stringify({
          filter: `product.id=${productId}`,
          limit: 10000,
          expand: 'product',
          moment: new Date().toISOString(),
          groupBy: 'product',
          store: 'all',
          order: 'product'
        })
      }
    });
    
    const data = response.data;
    cache.set(cacheKey, data, CACHE_TTL.stock);
    return data;
  },

  async getCategories(): Promise<MoySkladResponse<MoySkladCategory>> {
    const cacheKey = CACHE_KEYS.CATEGORIES();
    const cachedData = cache.get<MoySkladResponse<MoySkladCategory>>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const response = await moySkladApi.get('', {
      params: {
        method: 'get',
        url: '/entity/productfolder'
      }
    });
    const data = response.data;
    cache.set(cacheKey, data, CACHE_TTL.categories);
    return data;
  },

  async getStock(productId: string): Promise<MoySkladStock> {
    const cacheKey = CACHE_KEYS.STOCK(productId);
    const cachedData = cache.get<MoySkladStock>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const response = await moySkladApi.get('', {
      params: {
        method: 'get',
        url: '/report/stock/all',
        params: JSON.stringify({
          filter: `product.id=${productId}`,
          limit: 10000,
          expand: 'product',
          moment: new Date().toISOString(),
          groupBy: 'product',
          store: 'all',
          order: 'product'
        })
      }
    });
    
    const data = response.data;
    cache.set(cacheKey, data, CACHE_TTL.stock);
    return data;
  },

  async createOrder(orderData: any): Promise<MoySkladOrder> {
    const response = await moySkladApi.get('', {
      params: {
        method: 'post',
        url: '/entity/customerorder',
        params: JSON.stringify(orderData)
      }
    });
    return response.data;
  },

  async getOrder(id: string): Promise<MoySkladOrder> {
    const response = await moySkladApi.get('', {
      params: {
        method: 'get',
        url: `/entity/customerorder/${id}`
      }
    });
    return response.data;
  }
};

export const getProductImageUrl = (productId: string, imageId: string): string => {
  return `/api/images/${productId}/${imageId}`;
};