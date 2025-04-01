'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

interface TelegramUser {
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export default function ProfilePage() {
  const { user, isTelegramWebApp } = useTelegram();
  const router = useRouter();

  useEffect(() => {
    if (!isTelegramWebApp || !user) {
      router.push('/');
    }
  }, [isTelegramWebApp, user, router]);

  if (!user) return null;

  const telegramUser = user as TelegramUser;

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
                <p className="font-medium">{user.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Дата регистрации</p>
                <p className="font-medium">
                  {user.auth_date ? new Date(user.auth_date * 1000).toLocaleDateString('ru-RU') : 'Не указана'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 