'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { TelegramWebApps } from '@/types/telegram';

interface TelegramContextType {
  tg: TelegramWebApps;
  user: TelegramWebApps['initDataUnsafe']['user'] | undefined;
  onClose: () => void;
  onToggleMainButton: (show: boolean) => void;
  onToggleBackButton: (show: boolean) => void;
  setMainButtonText: (text: string) => void;
  onMainButtonClick: (callback: () => void) => void;
  onBackButtonClick: (callback: () => void) => void;
  sendData: (data: any) => void;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

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
  if (context === undefined) {
    throw new Error('useTelegramContext must be used within a TelegramProvider');
  }
  return context;
} 