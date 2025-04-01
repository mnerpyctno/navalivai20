import { useEffect, useState } from 'react';
import { TelegramWebApps } from '@/types/telegram';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  start_param?: string;
  photo_url?: string;
  auth_date?: number;
}

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<TelegramWebApps | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Проверяем, что мы находимся в HTTPS
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setError('Приложение должно работать через HTTPS');
        return;
      }

      // Проверяем, есть ли данные пользователя в URL (после авторизации)
      const searchParams = new URLSearchParams(window.location.search);
      const userId = searchParams.get('id');
      
      if (userId) {
        // Если есть данные пользователя, сохраняем их
        const userData: TelegramUser = {
          id: parseInt(userId),
          first_name: searchParams.get('first_name') || '',
          last_name: searchParams.get('last_name') || undefined,
          username: searchParams.get('username') || undefined,
          photo_url: searchParams.get('photo_url') || undefined,
          auth_date: parseInt(searchParams.get('auth_date') || '0'),
        };
        setUser(userData);
        
        // Очищаем URL от параметров авторизации
        window.history.replaceState({}, '', window.location.pathname);
      }

      // Проверяем наличие Telegram Web App
      const tg = window.Telegram?.WebApp;
      if (tg) {
        setWebApp(tg);
        if (!user) {
          setUser(tg.initDataUnsafe?.user || null);
        }
        tg.ready();
        setIsReady(true);
      } else {
        setError('Telegram Web App не найден');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при инициализации');
    }
  }, [user]);

  const onClose = () => {
    webApp?.close();
  };

  const onToggleMainButton = (show: boolean) => {
    if (!webApp?.MainButton) return;
    
    if (show) {
      webApp.MainButton.show();
    } else {
      webApp.MainButton.hide();
    }
  };

  const onToggleBackButton = (show: boolean) => {
    if (!webApp?.BackButton) return;
    
    if (show) {
      webApp.BackButton.show();
    } else {
      webApp.BackButton.hide();
    }
  };

  const setMainButtonText = (text: string) => {
    if (webApp?.MainButton) {
      webApp.MainButton.text = text;
    }
  };

  const onMainButtonClick = (callback: () => void) => {
    webApp?.MainButton?.onClick(callback);
  };

  const onBackButtonClick = (callback: () => void) => {
    webApp?.BackButton?.onClick(callback);
  };

  const sendData = (data: any) => {
    webApp?.sendData(JSON.stringify(data));
  };

  return {
    webApp,
    user,
    isReady,
    error,
    isTelegramWebApp: !!webApp,
    onClose,
    onToggleMainButton,
    onToggleBackButton,
    setMainButtonText,
    onMainButtonClick,
    onBackButtonClick,
    sendData
  };
}; 