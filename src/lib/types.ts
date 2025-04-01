// Типы данных
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  categoryId: string | null;
  available: boolean;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface MoySkladResponse<T> {
  rows: T[];
  meta: {
    href: string;
    type: string;
    mediaType: string;
    size: number;
    limit: number;
    offset: number;
  };
}

export interface MoySkladStock {
  quantity: number;
  product: {
    id?: string;
    meta: {
      href: string;
    };
  };
  store: {
    meta: {
      href: string;
    };
  };
}

// Импортируем типы из api/products.ts
export type { MoySkladProduct, MoySkladProductImage } from '@/api/products';

export interface MoySkladCategory {
  id: string;
  name: string;
  code?: string;
  description?: string;
  externalCode?: string;
  meta: {
    href: string;
    type: string;
    mediaType: string;
  };
}

export interface MoySkladWebhook {
  id: string;
  url: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  method: 'POST' | 'GET';
  enabled: boolean;
  meta: {
    href: string;
    type: string;
    mediaType: string;
  };
} 