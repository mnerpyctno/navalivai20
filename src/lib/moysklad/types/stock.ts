export interface StockReport {
  meta: {
    href: string;
    type: string;
    mediaType: string;
    size: number;
    limit: number;
    offset: number;
  };
  rows: StockRow[];
}

export interface StockRow {
  stock: number;
  reserve: number;
  inTransit: number;
  quantity: number;
  product?: {
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
  };
  store?: {
    id: string;
    name: string;
    meta: {
      href: string;
    };
  };
}

export interface StockParams {
  limit?: number;
  offset?: number;
  expand?: string;
  moment?: string;
  groupBy?: string;
  stockMode?: string;
  store?: string;
  filter?: string;
  order?: string;
}

export interface MoySkladParams {
  params?: StockParams;
} 