export interface StockData {
  id: string;
  name: string;
  quantity: number;
  price: number;
  store: string;
  updatedAt: string;
}

export interface MoySkladStockResponse {
  product: {
    id: string;
    name: string;
  };
  quantity: number;
  price: number;
  store: {
    name: string;
  };
} 