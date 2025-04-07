import { env } from './env';

// Базовые настройки API
export const API_CONFIG = {
  // Базовый URL API
  baseUrl: env.NEXT_PUBLIC_API_URL || 'https://navalivai20.vercel.app/api',
  
  // Таймауты
  timeout: 30000,
  
  // Заголовки по умолчанию
  defaultHeaders: {
    'Content-Type': 'application/json;charset=utf-8',
    'Accept': 'application/json;charset=utf-8'
  },
  
  // Настройки пагинации
  pagination: {
    defaultLimit: 100,
    maxLimit: 1000,
    defaultOffset: 0
  },
  
  // Настройки фильтрации
  filters: {
    defaultArchived: false,
    defaultActive: true
  }
} as const;

// Общие параметры запросов
export const DEFAULT_PARAMS = {
  limit: API_CONFIG.pagination.defaultLimit,
  offset: API_CONFIG.pagination.defaultOffset,
  expand: 'images,salePrices,productFolder,images.rows',
  order: 'name,asc',
  filter: `archived=${API_CONFIG.filters.defaultArchived}`
} as const;

// Типы для параметров запросов
export interface ApiParams {
  limit?: number;
  offset?: number;
  expand?: string;
  filter?: string;
  order?: string;
  [key: string]: any;
}

// Типы для ответов API
export interface ApiResponse<T> {
  meta: {
    href: string;
    type: string;
    mediaType: string;
    size: number;
    limit: number;
    offset: number;
  };
  rows: T[];
}
