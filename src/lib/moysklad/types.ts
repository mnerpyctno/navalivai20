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
  price: number;
  images: {
    rows: Array<{
      mini: {
        href: string;
      };
    }>;
  };
  meta: {
    href: string;
  };
}

export interface MoySkladStore {
  id: string;
  name: string;
  meta: {
    href: string;
  };
}

export interface MoySkladStockRow {
  stock: number;
  reserve: number;
  inTransit: number;
  quantity: number;
  product?: MoySkladProduct;
  store?: MoySkladStore;
}

export interface MoySkladStock {
  meta: MoySkladMeta;
  rows: MoySkladStockRow[];
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