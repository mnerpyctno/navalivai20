export interface Category {
  id: string;
  name: string;
  parentId?: string;
  pathName?: string;
  description?: string;
  image?: string;
}

export interface MoySkladCategory {
  id: string;
  name: string;
  parentId?: string;
  pathName?: string;
}

export interface StockInfo {
  stock: number;
  reserve: number;
  inTransit: number;
  available: boolean;
  store?: {
    id: string;
    name: string;
  };
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
  available: boolean;
  stock: number;
}

export interface MoySkladProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
  available: boolean;
  stock?: number;
}

export interface MoySkladResponse<T> {
  rows: T[];
  meta: {
    size: number;
    limit: number;
    offset: number;
  };
} 