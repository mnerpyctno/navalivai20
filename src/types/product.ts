export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  categoryId: string | null;
  code?: string;
} 