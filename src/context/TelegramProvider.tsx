'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { TelegramWebApps, TelegramUser } from '@/types/telegram';

interface TelegramContextType {
  webApp: TelegramWebApps | null;
  user: TelegramUser | null;
  isReady: boolean;
  error: string | null;
  isTelegramWebApp: boolean;
  onClose: () => void;
  onToggleMainButton: (show: boolean) => void;
  onToggleBackButton: (show: boolean) => void;
  setMainButtonText: (text: string) => void;
  onMainButtonClick: (callback: () => void) => void;
  onBackButtonClick: (callback: () => void) => void;
  sendData: (data: any) => void;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

export function TelegramProvider({ children }: { children: ReactNode }) {
  const telegram = useTelegram();

  return (
    <TelegramContext.Provider value={telegram}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegramContext() {
  const context = useContext(TelegramContext);
  if (!context) {
    if (typeof window === 'undefined') {
      // Возвращаем заглушку для серверного рендеринга
      return {
        webApp: null,
        user: null,
        isReady: false,
        error: null,
        isTelegramWebApp: false,
        onClose: () => {},
        onToggleMainButton: () => {},
        onToggleBackButton: () => {},
        setMainButtonText: () => {},
        onMainButtonClick: () => {},
        onBackButtonClick: () => {},
        sendData: () => {}
      } as TelegramContextType;
    }
    throw new Error('useTelegramContext must be used within a TelegramProvider');
  }
  return context;
}

export default TelegramProvider; 