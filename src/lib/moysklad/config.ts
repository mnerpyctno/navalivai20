import { env } from '@/config/env';

export const MOYSKLAD_CONFIG = {
  baseUrl: process.env.MOYSKLAD_API_URL || 'https://api.moysklad.ru/api/remap/1.2',
  version: '1.2',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'Accept': 'application/json;charset=utf-8'
  },
  endpoints: {
    productFolder: '/entity/productfolder',
    product: '/entity/product',
    stock: '/report/stock/all',
    image: '/entity/product',
  },
  defaultProductParams: {
    expand: 'images,salePrices,productFolder,images.rows',
    filter: 'archived=false',
    order: 'name,asc',
    limit: 10000
  }
} as const;

export const getMoySkladUrl = (path: string) => {
  return `${MOYSKLAD_CONFIG.baseUrl}${path}`;
};

export interface MoySkladParams {
  limit?: number;
  offset?: number;
  expand?: string;
  filter?: string;
  order?: string;
  moment?: string;
  groupBy?: string;
  stockMode?: string;
  store?: string;
  productId?: string;
  storeId?: string;
}

export interface MoySkladError {
  error: string;
  code: number;
  moreInfo?: string;
} 