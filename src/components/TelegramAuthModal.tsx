'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';
import TelegramLoginWidget from './TelegramLoginWidget';

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
  const handleTelegramAuth = (user: any) => {
    console.log('Telegram auth success:', user);
    setIsOpen(false);
    document.body.classList.remove('modal-open');
    // Обновляем страницу для отображения полной версии
    window.location.reload();
  };

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
        <div className="telegram-modal-header">
          <h2>Вход через Telegram</h2>
          <button 
            className="close-button"
            onClick={() => {
              setIsOpen(false);
              document.body.classList.remove('modal-open');
            }}
          >
            ✕
          </button>
        </div>
        <div className="telegram-modal-body">
          <p className="text-center mb-4">
            Пожалуйста, войдите через Telegram для продолжения
          </p>
          <TelegramLoginWidget onAuth={handleTelegramAuth} />
        </div>
      </div>
    </div>
  );
}; 