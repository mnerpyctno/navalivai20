import { useEffect, useState, useCallback } from 'react';
import { TelegramWebApps } from '@/types/telegram';
import { signIn } from 'next-auth/react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  start_param?: string;
  photo_url?: string;
  auth_date?: number;
  hash: string;
}

interface UserData {
  id: string;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  moySkladId?: string;
  ordersCount: number;
  cart?: {
    items: Array<{
      id: string;
      productId: string;
      quantity: number;
    }>;
  };
  orders?: Array<{
    id: string;
    moySkladId: string;
    status: string;
    totalAmount: number;
  }>;
}

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<TelegramWebApps | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  // Функция для синхронизации данных пользователя с сервером
  const syncUserData = async (telegramUser: TelegramUser) => {
    try {
      // Авторизуем пользователя через NextAuth
      const result = await signIn('credentials', {
        telegramId: telegramUser.id.toString(),
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        photoUrl: telegramUser.photo_url,
        redirect: false,
      });

      if (result?.error) {
        console.error('Auth error:', result.error);
        return;
      }

      // Создаем или обновляем пользователя в базе данных
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: telegramUser.id.toString(),
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          username: telegramUser.username,
          photoUrl: telegramUser.photo_url,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync user data');
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  };

  useEffect(() => {
    try {
      // Проверяем, что мы находимся в HTTPS
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setError('Приложение должно работать через HTTPS');
        return;
      }

      // Проверяем, запущено ли приложение в Telegram
      const tg = window.Telegram?.WebApp;
      if (tg) {
        setIsTelegramWebApp(true);
        setWebApp(tg);
        
        // Пытаемся получить данные пользователя из localStorage
        const savedUser = localStorage.getItem('telegram_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          // Синхронизируем данные с сервером
          syncUserData(parsedUser);
          return;
        }

        // Если данных нет в localStorage, получаем их из Telegram
        const initData = tg.initData;
        if (initData) {
          try {
            const initDataObj = JSON.parse(initData);
            if (initDataObj.user) {
              setUser(initDataObj.user);
              localStorage.setItem('telegram_user', JSON.stringify(initDataObj.user));
              // Синхронизируем данные с сервером
              syncUserData(initDataObj.user);
            }
          } catch (error) {
            console.error('Error parsing initData:', error);
          }
        }
        
        tg.ready();
        setIsReady(true);
      } else {
        setError('Telegram Web App не найден');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при инициализации');
    }
  }, []);

  const onClose = useCallback(() => {
    webApp?.close();
  }, [webApp]);

  const onToggleMainButton = useCallback((show: boolean) => {
    if (webApp) {
      if (show) {
        webApp.MainButton.show();
      } else {
        webApp.MainButton.hide();
      }
    }
  }, [webApp]);

  const onToggleBackButton = useCallback((show: boolean) => {
    if (webApp) {
      if (show) {
        webApp.BackButton.show();
      } else {
        webApp.BackButton.hide();
      }
    }
  }, [webApp]);

  const setMainButtonText = useCallback((text: string) => {
    if (webApp) {
      webApp.MainButton.text = text;
    }
  }, [webApp]);

  const onMainButtonClick = useCallback((callback: () => void) => {
    if (webApp) {
      webApp.MainButton.onClick(callback);
    }
  }, [webApp]);

  const onBackButtonClick = useCallback((callback: () => void) => {
    if (webApp) {
      webApp.BackButton.onClick(callback);
    }
  }, [webApp]);

  const sendData = useCallback((data: any) => {
    webApp?.sendData(data);
  }, [webApp]);

  return {
    webApp,
    user,
    userData,
    isReady,
    error,
    isTelegramWebApp,
    onClose,
    onToggleMainButton,
    onToggleBackButton,
    setMainButtonText,
    onMainButtonClick,
    onBackButtonClick,
    sendData
  };
}; 