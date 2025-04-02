'use client';

import { useEffect, useState } from 'react';
import { initApp } from '@/lib/init';
import { LoadingManager } from './LoadingManager';

const MIN_LOADING_TIME = 6000; // 6 секунд (10 сообщений по 0.6 секунды)

export default function InitProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [canShowContent, setCanShowContent] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Запускаем инициализацию
        const initPromise = initApp();
        
        // Устанавливаем минимальное время загрузки
        const minLoadingPromise = new Promise(resolve => 
          setTimeout(resolve, MIN_LOADING_TIME)
        );

        // Ждем завершения инициализации и минимального времени загрузки
        await Promise.all([initPromise, minLoadingPromise]);
        
        setIsInitialized(true);
        setCanShowContent(true);
      } catch (err) {
        console.error('Ошибка инициализации:', err);
        setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      }
    };

    init();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка инициализации</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!canShowContent) {
    return <LoadingManager />;
  }

  return <>{children}</>;
} 