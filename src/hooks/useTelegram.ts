import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function useTelegram() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setIsTelegramWebApp(true);
      const tg = window.Telegram.WebApp;
      const user = tg.initDataUnsafe?.user as TelegramUser;

      if (user) {
        // Сохраняем данные пользователя в localStorage
        localStorage.setItem('telegramUser', JSON.stringify(user));

        // Синхронизируем пользователя с МойСклад
        syncUserWithMoySklad(user);
      } else {
        // Если пользователь не авторизован в Telegram, выходим из сессии
        signOut();
      }
    }
    setIsLoading(false);
  }, []);

  const syncUserWithMoySklad = async (telegramUser: TelegramUser) => {
    try {
      const response = await fetch('/api/moysklad/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramUser }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync user with MoySklad');
      }
    } catch (error) {
      console.error('Error syncing user with MoySklad:', error);
    }
  };

  const getOrders = async () => {
    try {
      const response = await fetch('/api/moysklad/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  };

  const createOrder = async (items: Array<{ productId: string; quantity: number }>) => {
    try {
      const response = await fetch('/api/moysklad/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  return {
    isLoading,
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    isTelegramWebApp,
    getOrders,
    createOrder,
  };
} 