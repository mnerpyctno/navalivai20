import { useEffect, useState } from 'react';
import { TelegramWebApps, TelegramUser } from '@/types/telegram';

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApps | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        setWebApp(tg);
        setIsTelegramWebApp(true);

        // Получаем данные пользователя из localStorage
        const storedUser = localStorage.getItem('telegram_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser) as TelegramUser;
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing telegram user:', error);
            localStorage.removeItem('telegram_user');
          }
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to initialize Telegram WebApp');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Функция для создания пользователя в базе данных
  const createUser = async (userData: TelegramUser) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
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
    if (webApp?.MainButton) {
      webApp.MainButton.text = text;
    }
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
    user,
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
    createUser,
  };
} 