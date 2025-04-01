'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTelegram } from '@/hooks/useTelegram';
import { useEffect, useState } from 'react';

interface TelegramUser {
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  id: number;
  auth_date: number;
}

export default function Navigation() {
  const { user } = useTelegram();
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('telegramUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as TelegramUser;
        setTelegramUser(parsedUser);
      } catch (error) {
        console.error('Error parsing telegram user:', error);
      }
    }
  }, []);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Navalivaishop
          </Link>
          
          <div className="flex items-center space-x-4">
            {telegramUser ? (
              <Link href="/profile" className="flex items-center space-x-2">
                <div className="relative w-8 h-8">
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
                <span className="text-gray-700">{telegramUser.first_name}</span>
              </Link>
            ) : (
              <Link
                href="/"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 