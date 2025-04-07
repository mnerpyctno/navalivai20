// Типы данных
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  categoryId: string;
  available: boolean;
  stock: number;
  imageUrl?: string;  // Добавляем это поле
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface Order {
  id: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  status: string;
  createdAt: Date;
}

export interface OrderPosition {
  productId: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id?: string;  // Делаем id опциональным
  name: string;
  phone: string;
  email?: string;
  address?: string;
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

// Импортируем типы из product.ts
export type { MoySkladProduct } from '@/types/product';

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