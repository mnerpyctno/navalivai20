export interface Customer {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  article: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  customer: Customer;
  products: Product[];
  total: number;
  status: string;
  created: string;
}

export interface MoySkladProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  available: boolean;
}

export interface MoySkladCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}