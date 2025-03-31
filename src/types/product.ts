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