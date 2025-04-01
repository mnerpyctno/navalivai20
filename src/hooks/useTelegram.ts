import { useEffect, useState, useCallback } from 'react';
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
  hash: string;
}

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<TelegramWebApps | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

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
          setUser(JSON.parse(savedUser));
          return;
        }

        // Если данных нет в localStorage, получаем их из Telegram
        const initData = tg.initData;
        if (initData) {
          try {
            const initDataObj = JSON.parse(initData);
            if (initDataObj.user) {
              setUser(initDataObj.user);
              // Сохраняем данные пользователя в localStorage
              localStorage.setItem('telegram_user', JSON.stringify(initDataObj.user));
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