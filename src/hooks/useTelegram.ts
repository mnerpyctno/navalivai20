import { useEffect } from 'react';
import { TelegramWebApps } from '@/types/telegram';

export function useTelegram() {
  const tg = window.Telegram.WebApp;

  useEffect(() => {
    tg.ready();
    tg.expand();
  }, [tg]);

  const onClose = () => {
    tg.close();
  };

  const onToggleMainButton = (show: boolean) => {
    if (show) {
      tg.MainButton.show();
    } else {
      tg.MainButton.hide();
    }
  };

  const onToggleBackButton = (show: boolean) => {
    if (show) {
      tg.BackButton.show();
    } else {
      tg.BackButton.hide();
    }
  };

  const setMainButtonText = (text: string) => {
    tg.MainButton.text = text;
  };

  const onMainButtonClick = (callback: () => void) => {
    tg.MainButton.onClick(callback);
  };

  const onBackButtonClick = (callback: () => void) => {
    tg.BackButton.onClick(callback);
  };

  const sendData = (data: any) => {
    tg.sendData(JSON.stringify(data));
  };

  const user = tg.initDataUnsafe?.user;

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