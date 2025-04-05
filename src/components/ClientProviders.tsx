'use client';

import { ReactNode } from 'react';
import { CartProvider } from '@/context/CartContext';
import { TelegramProvider } from '@/context/TelegramProvider';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <TelegramProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </TelegramProvider>
  );
} 