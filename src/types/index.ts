export interface CartItem {
  id: number;
  title: string;
  price: number;
  oldPrice?: number;
  image: string;
  quantity: number;
  available?: number;
} 