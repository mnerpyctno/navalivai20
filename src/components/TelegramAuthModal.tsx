'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';
import Script from 'next/script';

export const TelegramAuthModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { isTelegramWebApp, user } = useTelegram();

  useEffect(() => {
    setIsClient(true);
    // Если пользователь авторизован через Telegram, закрываем модальное окно
    if (isTelegramWebApp && user) {
      setIsOpen(false);
      document.body.classList.remove('modal-open');
    } else {
      document.body.classList.add('modal-open');
    }

    // Очищаем класс при размонтировании компонента
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isTelegramWebApp, user]);

  // Функция обработки авторизации через Telegram
  useEffect(() => {
    // Добавляем функцию в глобальный объект window
    (window as any).onTelegramAuth = (user: any) => {
      // Здесь можно обработать данные пользователя
      setIsOpen(false);
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Не показываем модальное окно на сервере
  if (!isClient) return null;
  // Не показываем модальное окно, если оно закрыто
  if (!isOpen) return null;

  return (
    <div 
      className={`telegram-modal-overlay ${!isOpen ? 'hidden' : ''}`}
    >
      <div 
        className={`telegram-modal-content ${!isOpen ? 'hidden' : ''}`}
      >
        <div className="telegram-modal-icon">
          <svg 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.52.36-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.89.03-.24.37-.49 1.02-.75 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.14-.02.3-.03.42z"/>
          </svg>
        </div>
        <h2 className="telegram-modal-title">Вход через Telegram</h2>
        <p className="telegram-modal-description">
          Для использования приложения необходимо авторизоваться через Telegram
        </p>
        <Script
          src="https://telegram.org/js/telegram-widget.js?22"
          data-telegram-login="navalivaishop_bot"
          data-size="large"
          data-onauth="onTelegramAuth(user)"
          data-request-access="write"
        />
      </div>
    </div>
  );
}; 