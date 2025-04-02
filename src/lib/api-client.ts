import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api';
import { handleMoySkladError } from '@/lib/errorHandler';
import { MoySkladProduct, MoySkladResponse, ProductsResponse, MoySkladCategory } from '@/types/product';
import { env } from '@/config/env';

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
    // Проверка работы консоли
    console.warn('=== ПРОВЕРКА ЛОГИРОВАНИЯ ===');
    console.warn('Функция fetchProducts запущена');
    
    let allProducts: MoySkladProduct[] = [];
    let offset = 0;
    let hasMore = true;
    let totalRequests = 0;

    console.warn('=== Начало загрузки товаров ===');
    console.warn('Параметры запроса:', { categoryId, searchQuery });

    // Получаем все товары с помощью пагинации
    while (hasMore) {
      totalRequests++;
      const params = {
        limit: MAX_LIMIT,
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

      console.warn(`\nЗапрос #${totalRequests}:`);
      console.warn(`Offset: ${offset}`);
      console.warn(`Параметры запроса:`, params);

      const response = await api.get('/moysklad/entity/product', { params });
      
      const products = response.data.rows || [];
      allProducts = [...allProducts, ...products];
      
      console.warn(`Результаты запроса #${totalRequests}:`);
      console.warn(`- Получено товаров в текущем запросе: ${products.length}`);
      console.warn(`- Всего получено товаров: ${allProducts.length}`);
      console.warn(`- Всего товаров в системе: ${response.data.meta?.size || 0}`);
      console.warn(`- Процент загрузки: ${((allProducts.length / (response.data.meta?.size || 1)) * 100).toFixed(2)}%`);

      // Проверяем, есть ли еще товары
      hasMore = products.length === MAX_LIMIT;
      if (hasMore) {
        offset += MAX_LIMIT;
      }
    }

    console.warn('\n=== Итоги загрузки товаров ===');
    console.warn(`Всего сделано запросов: ${totalRequests}`);
    console.warn(`Общее количество полученных товаров: ${allProducts.length}`);

    // Получаем остатки для всех товаров одним запросом
    console.warn('\n=== Загрузка остатков ===');
    const stockResponse = await api.get('/moysklad/report/stock/bystore', {
      params: {
        limit: MAX_LIMIT,
        expand: 'product',
        moment: new Date().toISOString(),
        groupBy: 'product',
        store: 'all',
        order: 'product'
      }
    });

    console.warn(`Получено записей об остатках: ${stockResponse.data.rows?.length || 0}`);

    // Создаем мапу остатков для быстрого доступа
    const stockMap = new Map(
      stockResponse.data.rows.map((row: any) => [
        row.product?.id,
        row.quantity || 0
      ])
    );

    const products = allProducts.map((product: MoySkladProduct) => {
      const stock = stockMap.get(product.id) || 0;
      const image = product.images?.rows?.[0];
      const imageUrl = image?.miniature?.href || image?.meta?.href || '';
      
      return {
        id: product.id,
        name: product.name,
        price: product.salePrices?.[0]?.value ? product.salePrices[0].value / 100 : 0,
        image: getImageUrl(imageUrl),
        description: product.description || '',
        categoryId: product.productFolder?.meta?.href?.split('/').pop() || '',
        available: stock > 0,
        stock
      };
    });

    console.warn('\n=== Итоги обработки ===');
    console.warn(`Обработано товаров: ${products.length}`);
    console.warn(`Товаров с остатками: ${products.filter(p => p.stock > 0).length}`);
    console.warn(`Товаров без остатков: ${products.filter(p => p.stock === 0).length}`);

    const total = allProducts.length;
    return {
      products,
      total,
      hasMore: false
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Ошибка при получении списка товаров');
  }
} 