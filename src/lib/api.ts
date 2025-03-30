import axios, { InternalAxiosRequestConfig } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  Product, 
  Category, 
  MoySkladResponse, 
  MoySkladProduct, 
  MoySkladCategory 
} from './types';

// Экспортируем типы
export type { Product, Category };

// Создаем базовую конфигурацию API
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'Accept': 'application/json;charset=utf-8'
  },
  timeout: 60000,
  validateStatus: function (status: number) {
    return status >= 200 && status < 500;
  }
});

// Добавляем интерцептор для логирования запросов
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('Отправка запроса:', {
      url: config.url,
      method: config.method,
      params: config.params
    });
    return config;
  },
  (error: Error) => {
    console.error('Ошибка при отправке запроса:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Успешный ответ:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error: Error) => {
    console.error('Ошибка ответа:', {
      status: (error as any).response?.status,
      url: (error as any).config?.url,
      data: (error as any).response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Функция для получения URL изображения
export const getProductImageUrl = (product: MoySkladProduct): string => {
  if (!product.images?.rows?.length) {
    return '/default-product.jpg';
  }
  
  const image = product.images.rows[0];
  return image.miniature?.href || '/default-product.jpg';
};

// Функция для получения групп товаров (категорий)
export const getProductGroups = async (): Promise<Category[]> => {
  try {
    const params = {
      limit: 100,
      filter: 'archived=false',
      order: 'name,asc'
    };

    console.log('Отправка запроса категорий:', params);

    const response = await api.get('/api/moysklad', {
      params: {
        method: 'get',
        url: 'entity/productfolder',
        params: JSON.stringify(params)
      }
    });

    console.log('Ответ категорий:', response.data);

    if (!response.data || !Array.isArray(response.data.rows)) {
      console.warn('Нет данных о категориях в ответе:', response.data);
      return [];
    }

    return response.data.rows.map((item: MoySkladCategory) => ({
      id: item.id,
      name: item.name
    }));
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    return [];
  }
};

// Функция получения товаров
export const getProducts = async (categoryId?: string): Promise<Product[]> => {
  try {
    const params: any = {
      limit: 100,
      offset: 0,
      expand: 'images,salePrices,productFolder',
      filter: 'archived=false'
    };

    if (categoryId) {
      params.filter = `archived=false;productFolder.id=${categoryId}`;
    }

    console.log('Отправка запроса товаров:', params);

    const response = await api.get('/api/moysklad', {
      params: {
        method: 'get',
        url: 'entity/product',
        params: JSON.stringify(params)
      }
    });

    console.log('Ответ товаров:', response.data);

    if (!response.data || !Array.isArray(response.data.rows)) {
      console.warn('Нет данных о товарах в ответе:', response.data);
      return [];
    }

    return response.data.rows.map((item: MoySkladProduct) => ({
      id: item.id,
      name: item.name,
      price: extractProductPrice(item),
      image: getProductImageUrl(item),
      description: item.description || '',
      categoryId: item.productFolder?.meta?.href?.split('/').pop() || ''
    }));
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    return [];
  }
};

// Функция для извлечения цены товара
const extractProductPrice = (product: MoySkladProduct): number => {
  if (product.salePrices && product.salePrices.length > 0) {
    return product.salePrices[0].value / 100; // Цена в МойСклад хранится в копейках
  }
  return 0;
};

// Функция поиска
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const params = {
      limit: 100,
      offset: 0,
      expand: 'images,salePrices,productFolder',
      filter: `archived=false;name~=${query}`
    };

    const response = await api.get('/api/moysklad', {
      params: {
        method: 'get',
        url: 'entity/product',
        params: JSON.stringify(params)
      },
      timeout: 60000
    });

    if (!response.data || !Array.isArray(response.data.rows)) {
      console.warn('Нет данных о товарах в ответе поиска:', response.data);
      return [];
    }

    return response.data.rows.map((item: MoySkladProduct) => ({
      id: item.id,
      name: item.name,
      price: extractProductPrice(item),
      image: getProductImageUrl(item),
      description: item.description || '',
      categoryId: item.productFolder?.meta?.href?.split('/').pop() || ''
    }));
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    return [];
  }
}; 