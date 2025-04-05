'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    onTelegramAuth?: (user: any) => void;
  }
}

interface TelegramLoginWidgetProps {
  onAuth: (user: any) => void;
}

export default function TelegramLoginWidget({ onAuth }: TelegramLoginWidgetProps) {
  useEffect(() => {
    // Определяем функцию обработки авторизации
    window.onTelegramAuth = (user) => {
      onAuth(user);
    };

    // Загружаем скрипт виджета
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'navalivaishop_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    // Добавляем скрипт в DOM
    const container = document.getElementById('telegram-login-widget');
    if (container) {
      container.appendChild(script);
    }

    // Очистка при размонтировании
    return () => {
      if (container) {
        container.innerHTML = '';
      }
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, [onAuth]);

  return <div id="telegram-login-widget" className="flex justify-center" />;
} 