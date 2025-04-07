import { env } from '@/config/env';

export const DATABASE_CONFIG = {
  url: env.databaseUrl,
<<<<<<< HEAD
  supabaseUrl: env.supabaseUrl,
  supabaseKey: env.supabaseKey
=======
  directUrl: env.directUrl,
  supabaseUrl: env.supabaseUrl,
  supabaseAnonKey: env.supabaseAnonKey
>>>>>>> 403f6ea (Last version)
} as const;

// Типы для основных сущностей
export interface User {
  id: string;
  telegramId: string;
  name: string;
  username?: string;
  moySkladId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  moySkladId: string;
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
} 