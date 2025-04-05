export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl: string | null;
  categoryId: string;
  categoryName?: string;
  available: boolean;
  stock: number;
  quantity?: number;
  article?: string;
  weight?: number;
  volume?: number;
  isArchived?: boolean;
}

export interface StockInfo {
  stock: number;
  reserve: number;
  inTransit: number;
  available: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface MoySkladResponse<T> {
  meta: {
    size: number;
  };
  rows: T[];
}

export interface MoySkladProduct {
  id: string;
  name: string;
  description?: string;
  salePrices?: Array<{
    value: number;
    priceType?: {
      name: string;
    };
  }>;
  images?: {
    rows: Array<{
      meta: {
        href: string;
        type: string;
        mediaType: string;
      };
      title: string;
      miniature: {
        href: string;
        type: string;
        mediaType: string;
      };
      tiny: {
        href: string;
        type: string;
        mediaType: string;
      };
    }>;
  };
  productFolder?: {
    id: string;
    name: string;
    meta: {
      href: string;
    };
  };
  article?: string;
  weight?: number;
  volume?: number;
  archived?: boolean;
}

export interface MoySkladCategory {
  id: string;
  name: string;
  description?: string;
  images?: {
    rows: Array<{
      miniature: {
        href: string;
      };
    }>;
  };
}

export interface MoySkladOrder {
  id: string;
  name: string;
  created: string;
  updated: string;
  positions: Array<{
    quantity: number;
    price: number;
    product: {
      meta: {
        href: string;
      };
    };
  }>;
}

export interface MoySkladMeta {
  href: string;
  type: string;
  mediaType: string;
  size?: number;
  limit?: number;
  offset?: number;
}

export interface MoySkladImage {
  meta: {
    href: string;
    type: string;
    mediaType: string;
    downloadHref?: string;
  };
  title: string;
  miniature: {
    href: string;
    type: string;
    mediaType: string;
  };
  tiny: {
    href: string;
    type: string;
    mediaType: string;
  };
  downloadHref?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
}

export interface CartItem extends Product {
  quantity: number;
} 