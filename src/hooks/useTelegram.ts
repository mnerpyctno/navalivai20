import { useEffect, useState } from 'react';
import { TelegramWebApps } from '@/types/telegram';

export function useTelegram() {
  const [tg, setTg] = useState<TelegramWebApps | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      // Проверяем данные от Telegram
      const validateTelegramData = async () => {
        try {
          const response = await fetch('/api/telegram/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              initData: webApp.initData
            }),
          });

          const data = await response.json();
          if (data.ok) {
            setIsValid(true);
            setTg(webApp);
            webApp.ready();
            webApp.expand();
          } else {
            console.error('Invalid Telegram data');
          }
        } catch (error) {
          console.error('Error validating Telegram data:', error);
        }
      };

      validateTelegramData();
    }
  }, []);

  const onClose = () => {
    tg?.close();
  };

  const onToggleMainButton = (show: boolean) => {
    if (!tg?.MainButton) return;
    
    if (show) {
      tg.MainButton.show();
    } else {
      tg.MainButton.hide();
    }
  };

  const onToggleBackButton = (show: boolean) => {
    if (!tg?.BackButton) return;
    
    if (show) {
      tg.BackButton.show();
    } else {
      tg.BackButton.hide();
    }
  };

  const setMainButtonText = (text: string) => {
    if (tg?.MainButton) {
      tg.MainButton.text = text;
    }
  };

  const onMainButtonClick = (callback: () => void) => {
    tg?.MainButton?.onClick(callback);
  };

  const onBackButtonClick = (callback: () => void) => {
    tg?.BackButton?.onClick(callback);
  };

  const sendData = (data: any) => {
    tg?.sendData(JSON.stringify(data));
  };

  const user = tg?.initDataUnsafe?.user;

  return {
    tg,
    user,
    isValid,
    onClose,
    onToggleMainButton,
    onToggleBackButton,
    setMainButtonText,
    onMainButtonClick,
    onBackButtonClick,
    sendData
  };
} 