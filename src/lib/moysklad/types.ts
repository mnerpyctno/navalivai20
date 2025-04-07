export interface MoySkladMeta {
  href: string;
  type: string;
  mediaType: string;
  size: number;
  limit: number;
  offset: number;
}

export interface MoySkladProduct {
  id: string;
  name: string;
  code: string;
  article: string;
  description?: string;
  images?: {
    meta: {
      size: number;
    };
    rows: Array<{
      miniature: {
        href: string;
      };
    }>;
  };
  salePrices?: Array<{
    value: number;
  }>;
  productFolder?: {
    name: string;
    meta: {
      href: string;
    };
  };
}

export interface MoySkladStore {
  id: string;
  name: string;
  meta: {
    href: string;
  };
}

export interface MoySkladCategory {
  id: string;
  name: string;
  code: string;
  externalCode: string;
  pathName: string;
  productFolder: {
    id: string;
    name: string;
  };
  meta: {
    href: string;
  };
}

export interface MoySkladResponse<T> {
  meta: {
    href: string;
    type: string;
    mediaType: string;
    size: number;
    limit: number;
    offset: number;
  };
  rows: T[];
} 