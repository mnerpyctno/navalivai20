import { env } from '@/config/env';

export const DATABASE_CONFIG = {
  url: env.databaseUrl || process.env.DATABASE_URL,
  supabaseUrl: env.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: env.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY
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