'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';
import TelegramLoginWidget from './TelegramLoginWidget';

export const TelegramAuthModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isTelegramWebApp, user, createUser } = useTelegram();

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
  const handleTelegramAuth = async (user: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Создаем пользователя в базе данных
      await createUser(user);
      
      // Сохраняем данные пользователя в localStorage
      localStorage.setItem('telegram_user', JSON.stringify(user));
      
      setIsOpen(false);
      document.body.classList.remove('modal-open');
      
      // Обновляем состояние без перезагрузки страницы
      window.dispatchEvent(new Event('storage'));
      
      // Перенаправляем на страницу профиля
      router.push('/profile');
    } catch (error) {
      console.error('Error during Telegram auth:', error);
      setError('Ошибка при авторизации. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  // Не показываем модальное окно на сервере
  if (!isClient) return null;
  // Не показываем модальное окно, если оно закрыто
  if (!isOpen) return null;

  return (
    <div className="telegram-modal-overlay">
      <div className="telegram-modal-content">
        <div className="telegram-modal-header">
          <h2>Добро пожаловать в Navalivaishop</h2>
        </div>
        <div className="telegram-modal-body">
          <p>
            Для доступа к полной версии магазина, пожалуйста, войдите через Telegram.
            Это обеспечит безопасную и удобную авторизацию.
          </p>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="telegram-login-widget">
            <TelegramLoginWidget onAuth={handleTelegramAuth} />
          </div>
          {isLoading && (
            <div className="loading-message">
              Загрузка...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 