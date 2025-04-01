import axios, { InternalAxiosRequestConfig } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  Product, 
  Category, 
  MoySkladResponse, 
  MoySkladProduct, 
  MoySkladCategory,
  MoySkladProductImage 
} from './types';
import { categoriesApi, productsApi, stockApi } from '@/api';

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
    return config;
  },
  (error: Error) => {
    console.error('Ошибка при отправке запроса:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
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
  try {
    console.log('Получение URL изображения для товара:', {
      id: product.id,
      name: product.name,
      hasImages: !!product.images,
      imagesMeta: product.images?.meta,
      imagesRows: product.images?.rows?.length,
      firstImage: product.images?.rows?.[0],
      firstImageMiniature: product.images?.rows?.[0]?.miniature
    });

    // Проверяем наличие изображений и их расширение
    if (!product.images?.rows?.length || !product.images?.rows?.[0]?.miniature?.href) {
      console.log('Нет доступных изображений для товара:', {
        productName: product.name,
        productId: product.id,
        hasImages: !!product.images,
        imagesMeta: product.images?.meta,
        imagesRows: product.images?.rows?.length
      });
      return '/default-product.jpg';
    }

    // Получаем URL миниатюры
    const originalUrl = product.images.rows[0].miniature.href;
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
    
    console.log('Получен URL изображения из объекта товара:', {
      originalUrl,
      proxyUrl,
      productName: product.name,
      productId: product.id
    });
    
    return proxyUrl;
  } catch (error) {
    console.error('Ошибка при получении URL изображения:', {
      error,
      productName: product.name,
      productId: product.id
    });
    return '/default-product.jpg';
  }
};

// Функция для получения групп товаров (категорий)
export const getProductGroups = async (): Promise<Category[]> => {
  try {
    const response = await categoriesApi.getCategories({
      filter: 'archived=false',
      order: 'name,asc'
    });

    if (!response.rows) {
      console.warn('Нет данных о категориях в ответе:', response);
      return [];
    }

    return response.rows.map((item) => ({
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
    // 1. Получаем все товары
    const productsResponse = await productsApi.getProducts({
      limit: 1000,
      offset: 0,
      categoryId,
      expand: 'images,salePrices,productFolder,images.rows',
      filter: 'archived=false'
    });

    if (!productsResponse.rows) {
      console.warn('Нет данных о товарах в ответе:', productsResponse);
      return [];
    }

    // 2. Получаем все остатки
    const stockResponse = await stockApi.getAllStock();

    // 3. Создаем карту остатков для быстрого доступа
    const stockMap = new Map<string, number>();
    if (stockResponse.rows) {
      stockResponse.rows.forEach((stock) => {
        const productId = stock.product.meta.href.split('/').pop();
        if (productId) {
          const currentStock = stockMap.get(productId) || 0;
          stockMap.set(productId, currentStock + stock.quantity);
        }
      });
    }

    // 4. Формируем финальный массив товаров с остатками
    const products = productsResponse.rows.map((product) => {
      const stock = stockMap.get(product.id) || 0;
      const imageUrl = getProductImageUrl(product);
      
      console.log('Формирование данных товара:', {
        productId: product.id,
        productName: product.name,
        rawImageData: product.images,
        processedImageUrl: imageUrl
      });

      return {
        id: product.id,
        name: product.name,
        price: product.salePrices?.[0]?.value ? product.salePrices[0].value / 100 : 0,
        image: imageUrl,
        description: product.description || '',
        categoryId: product.productFolder?.meta?.href?.split('/').pop() || '',
        available: stock > 0,
        stock
      };
    });

    return products;
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
    // 1. Получаем все товары
    const productsResponse = await productsApi.getProducts({
      limit: 100,
      offset: 0,
      expand: 'images,salePrices,productFolder,images.rows',
      filter: `archived=false;name~=${query}`
    });

    if (!productsResponse.rows) {
      console.warn('Нет данных о товарах в ответе поиска:', productsResponse);
      return [];
    }

    // 2. Получаем все остатки
    const stockResponse = await stockApi.getAllStock();

    // 3. Создаем карту остатков для быстрого доступа
    const stockMap = new Map<string, number>();
    if (stockResponse.rows) {
      stockResponse.rows.forEach((stock) => {
        const productId = stock.product.meta.href.split('/').pop();
        if (productId) {
          const currentStock = stockMap.get(productId) || 0;
          stockMap.set(productId, currentStock + stock.quantity);
        }
      });
    }

    // 4. Формируем список товаров с остатками
    return productsResponse.rows.map((product) => {
      const stock = stockMap.get(product.id) || 0;
      const imageUrl = getProductImageUrl(product);
      
      console.log('Обработка товара в поиске:', {
        productId: product.id,
        productName: product.name,
        rawImageData: product.images,
        processedImageUrl: imageUrl,
        hasImages: !!product.images,
        imagesMeta: product.images?.meta,
        imagesRows: product.images?.rows?.length,
        firstImage: product.images?.rows?.[0],
        firstImageMiniature: product.images?.rows?.[0]?.miniature
      });

      return {
        id: product.id,
        name: product.name,
        price: product.salePrices?.[0]?.value ? product.salePrices[0].value / 100 : 0,
        image: imageUrl,
        description: product.description || '',
        categoryId: product.productFolder?.meta?.href?.split('/').pop() || '',
        available: stock > 0,
        stock
      };
    });
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    return [];
  }
}; 