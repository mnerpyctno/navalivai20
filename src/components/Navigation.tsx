'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTelegram } from '@/hooks/useTelegram';

export default function Navigation() {
  const { user } = useTelegram();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Navalivaishop
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Link href="/profile" className="flex items-center space-x-2">
                <Image
                  src={user.photo_url || '/default-avatar.png'}
                  alt={user.first_name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-gray-700">{user.first_name}</span>
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