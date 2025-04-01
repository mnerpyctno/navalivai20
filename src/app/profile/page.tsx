'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface TelegramUser {
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  id: number;
  auth_date: number;
}

export default function ProfilePage() {
  const { user, isTelegramWebApp } = useTelegram();
  const router = useRouter();
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    if (!isTelegramWebApp || !user) {
      router.push('/');
      return;
    }

    // Получаем данные пользователя из localStorage
    const storedUser = localStorage.getItem('telegramUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as TelegramUser;
        setTelegramUser(parsedUser);
      } catch (error) {
        console.error('Error parsing telegram user:', error);
      }
    }
  }, [isTelegramWebApp, user, router]);

  if (!telegramUser) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative w-20 h-20">
            {telegramUser.photo_url ? (
              <Image
                src={telegramUser.photo_url}
                alt={telegramUser.first_name}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <Image
                src="/profile-icon.svg"
                alt="Профиль"
                fill
                className="rounded-full"
              />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {telegramUser.first_name} {telegramUser.last_name}
            </h1>
            <p className="text-gray-600">@{telegramUser.username}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-2">Информация о пользователе</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">ID пользователя</p>
                <p className="font-medium">{telegramUser.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Дата регистрации</p>
                <p className="font-medium">
                  {new Date(telegramUser.auth_date * 1000).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 