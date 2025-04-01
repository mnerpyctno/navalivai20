import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { TelegramWebApps, TelegramUser } from '@/types/telegram';

export function useTelegram() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const [webApp, setWebApp] = useState<TelegramWebApps | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setIsTelegramWebApp(true);
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
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
      setError('Failed to sync user with MoySklad');
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

  const onClose = () => {
    webApp?.close();
  };

  const onToggleMainButton = (show: boolean) => {
    if (show) {
      webApp?.MainButton.show();
    } else {
      webApp?.MainButton.hide();
    }
  };

  const onToggleBackButton = (show: boolean) => {
    if (show) {
      webApp?.BackButton.show();
    } else {
      webApp?.BackButton.hide();
    }
  };

  const setMainButtonText = (text: string) => {
    webApp?.MainButton.setText(text);
  };

  const onMainButtonClick = (callback: () => void) => {
    webApp?.MainButton.onClick(callback);
  };

  const onBackButtonClick = (callback: () => void) => {
    webApp?.BackButton.onClick(callback);
  };

  const sendData = (data: any) => {
    webApp?.sendData(JSON.stringify(data));
  };

  return {
    webApp,
    user: session?.user as TelegramUser | null,
    isReady: !isLoading,
    error,
    isTelegramWebApp,
    onClose,
    onToggleMainButton,
    onToggleBackButton,
    setMainButtonText,
    onMainButtonClick,
    onBackButtonClick,
    sendData,
    getOrders,
    createOrder,
  };
} 