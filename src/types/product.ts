export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string | null;
  description: string;
  categoryId: string;
  available: boolean;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
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
  }>;
  images?: {
    rows: Array<{
      miniature: {
        href: string;
      };
    }>;
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
  description?: string;
  images?: {
    rows: Array<{
      miniature: {
        href: string;
      };
    }>;
  };
}

export interface MoySkladStock {
  rows: Array<{
    quantity: number;
    product: {
      id: string;
      name: string;
    };
    store: {
      id: string;
      name: string;
    };
  }>;
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
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
}

export interface CartItem extends Product {
  quantity: number;
} 