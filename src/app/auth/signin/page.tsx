'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export default function SignIn() {
  const router = useRouter();

  useEffect(() => {
    const handleTelegramAuth = async () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        const user = tg.initDataUnsafe?.user as TelegramUser;

        if (user) {
          const result = await signIn('credentials', {
            telegramId: user.id.toString(),
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            photoUrl: user.photo_url,
            redirect: false,
          });

          if (result?.ok) {
            router.push('/');
          }
        }
      }
    };

    handleTelegramAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Вход через Telegram</h1>
        <p className="text-gray-600">Пожалуйста, подождите...</p>
      </div>
    </div>
  );
} 