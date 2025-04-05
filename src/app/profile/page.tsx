'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, isTelegramWebApp } = useTelegram();
  const router = useRouter();

  useEffect(() => {
    if (!isTelegramWebApp || !user) {
      router.push('/');
    }
  }, [isTelegramWebApp, user, router]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative w-20 h-20">
            {user.photo_url ? (
              <Image
                src={user.photo_url}
                alt={user.first_name}
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
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-600">@{user.username}</p>
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
              {user.auth_date && (
                <div>
                  <p className="text-gray-600">Дата регистрации</p>
                  <p className="font-medium">
                    {new Date(user.auth_date * 1000).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 