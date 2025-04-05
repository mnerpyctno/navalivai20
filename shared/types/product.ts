export interface Category {
  id: string;
  name: string;
  parentId?: string;
  pathName?: string;
  children?: Category[];
}

export interface MoySkladCategory {
  meta: {
    href: string;
    type: string;
    mediaType: string;
  };
  id: string;
  name: string;
  productFolder?: {
    meta: {
      href: string;
      type: string;
      mediaType: string;
    };
  };
  pathName?: string;
}

export interface StockInfo {
  quantity: number;
  store: {
    id: string;
    name: string;
  };
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category?: Category;
  stock: StockInfo[];
  archived: boolean;
  active: boolean;
}

export interface MoySkladProduct {
  meta: {
    href: string;
    type: string;
    mediaType: string;
  };
  id: string;
  name: string;
  description?: string;
  salePrices: {
    value: number;
    priceType: {
      name: string;
    };
  }[];
  images: {
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
    };
    tiny: {
      href: string;
      type: string;
      mediaType: string;
    };
  }[];
  productFolder?: {
    meta: {
      href: string;
      type: string;
      mediaType: string;
    };
  };
  archived: boolean;
  active: boolean;
} 