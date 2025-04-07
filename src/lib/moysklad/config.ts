export interface MoySkladParams {
  limit?: number;
  offset?: number;
  expand?: string;
  filter?: string;
  order?: string;
  [key: string]: any;
}

export const MOYSKLAD_CONFIG = {
  baseUrl: 'https://api.moysklad.ru/api/remap/1.2',
  endpoints: {
    productFolder: '/entity/productfolder',
    product: '/entity/product',
    stock: '/report/stock/bystore'
  },
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  defaultProductParams: {
    expand: 'images,salePrices,productFolder,images.rows',
    order: 'name,asc',
    filter: 'archived=false'
  }
} as const; 