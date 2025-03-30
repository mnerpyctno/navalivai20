import { useEffect, useState } from 'react';
import { TelegramWebApps } from '@/types/telegram';

export function useTelegram() {
  const [tg, setTg] = useState<TelegramWebApps | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      setTg(webApp);
      webApp.ready();
      webApp.expand();
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
    onClose,
    onToggleMainButton,
    onToggleBackButton,
    setMainButtonText,
    onMainButtonClick,
    onBackButtonClick,
    sendData
  };
} 