export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  categoryId: string | null;
  available: boolean;
  description?: string;
  code?: string;
  stock: number;
}

export interface MoySkladProduct {
  id: string;
  name: string;
  description?: string;
  code?: string;
  images?: {
    meta: {
      href: string;
      type: string;
      mediaType: string;
      size: number;
      limit: number;
      offset: number;
    };
    rows: Array<{
      meta: {
        href: string;
        type: string;
        mediaType: string;
      };
      title: string;
      filename: string;
      size: number;
      updated: string;
      miniature: {
        href: string;
        type: string;
        mediaType: string;
        downloadHref?: string;
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
  quantity?: number;
  archived?: boolean;
}

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

export interface ProductsResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
} 