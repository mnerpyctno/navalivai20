// Типы данных
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  categoryId: string | null;
  code?: string;
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

export interface MoySkladProduct {
  id: string;
  name: string;
  description?: string;
  code?: string;
  images?: {
    rows: Array<{
      miniature?: {
        href: string;
      };
    }>;
  };
  salePrices?: Array<{
    value: number;
    currency?: {
      name: string;
      code: string;
    };
  }>;
  minPrice?: {
    value: number;
  };
  productFolder?: {
    meta: {
      href: string;
    };
  };
}

export interface MoySkladCategory {
  id: string;
  name: string;
} 