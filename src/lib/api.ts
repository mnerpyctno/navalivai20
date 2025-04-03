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

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 секунда

// Создаем базовый API клиент для работы с MoySklad API через прокси
const moySkladApi = axios.create({
  baseURL: `${env.apiUrl}/proxy`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Добавляем интерцептор для логирования запросов
moySkladApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.method) {
      config.method = 'get';
    }
    return config;
  },
  (error: Error) => {
    return Promise.reject(error);
  }
);

// Добавляем интерцептор для обработки ошибок
moySkladApi.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    
    // Если это ошибка 412 или 429 и мы еще не превысили лимит попыток
    if ((error.response?.status === 412 || error.response?.status === 429) && 
        (!config._retry || config._retry < MAX_RETRIES)) {
      
      config._retry = (config._retry || 0) + 1;
      
      // Получаем время ожидания из заголовка или используем значение по умолчанию
      const retryAfter = error.response?.headers['x-lognex-retry-after'] || 3;
      // Используем экспоненциальную задержку: 3с, 6с, 12с
      const delay = parseInt(retryAfter) * 1000 * Math.pow(2, config._retry - 1);
      
      console.log(`Повторная попытка запроса ${config._retry}/${MAX_RETRIES} через ${delay/1000} секунд`);
      
      // Ждем указанное время перед повторной попыткой
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Повторяем запрос
      return moySkladApi(config);
    }
    
    // Добавляем более информативные сообщения об ошибках
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 412:
          error.message = data.message || 'Условие запроса не выполнено';
          break;
        case 429:
          error.message = data.message || 'Превышен лимит запросов к API';
          break;
        case 401:
          error.message = 'Ошибка авторизации';
          break;
        case 403:
          error.message = 'Доступ запрещен';
          break;
        case 404:
          error.message = 'Ресурс не найден';
          break;
        case 500:
          error.message = 'Внутренняя ошибка сервера';
          break;
        default:
          error.message = data.message || 'Произошла ошибка при выполнении запроса';
      }
    } else if (error.request) {
      error.message = 'Сервер не отвечает';
    } else {
      error.message = 'Ошибка при настройке запроса';
    }
    
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
    // Временно отключаем запрос остатков
    console.log('Запрос остатков временно отключен');
    return {
      meta: {
        size: 0
      },
      rows: []
    };
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
    // Временно отключаем запрос остатков
    console.log('Запрос остатков временно отключен');
    return {
      meta: {
        size: 0
      },
      rows: []
    } as MoySkladStock;
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

export const getProductImageUrl = (product: MoySkladProduct): string | null => {
  if (!product.id) {
    console.error('Product ID is missing:', { product });
    return null;
  }

  const imageUrl = `/api/images/${product.id}?miniature=true`;
  console.log('Generated image URL:', { productId: product.id, imageUrl });
  
  return imageUrl;
};

export default moySkladApi;