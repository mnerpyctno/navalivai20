'use client';

import { useEffect, useState } from 'react';
import { initClientApp } from '../lib/client-init';
import LoadingScreen from './LoadingScreen';

const MIN_LOADING_TIME = 6000; // 6 секунд (10 сообщений по 0.6 секунды)

const useInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [canShowContent, setCanShowContent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        // Запускаем инициализацию клиента
        const initPromise = initClientApp();
        
        // Предварительно загружаем основные данные
        const preloadData = async () => {
          try {
            // Загружаем категории
            const categoriesResponse = await fetch('/api/categories');
            if (!categoriesResponse.ok) throw new Error('Failed to load categories');
            
            // Загружаем первую страницу товаров
            const productsResponse = await fetch('/api/products?limit=9&offset=0');
            if (!productsResponse.ok) throw new Error('Failed to load products');
          } catch (error) {
            console.error('Ошибка при предварительной загрузке данных:', error);
          }
        };

        // Запускаем предварительную загрузку данных
        const preloadPromise = preloadData();
        
        // Устанавливаем минимальное время загрузки
        const minLoadingPromise = new Promise(resolve => 
          setTimeout(resolve, MIN_LOADING_TIME)
        );

        // Ждем завершения инициализации и предварительной загрузки
        await Promise.all([initPromise, preloadPromise]);
        setIsInitialized(true);

        // Ждем минимальное время загрузки
        await minLoadingPromise;
        setCanShowContent(true);
      } catch (err) {
        console.error('Ошибка инициализации:', err);
        setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      }
    };

    init();
  }, []);

  return { isInitialized, error, canShowContent, isMounted };
};

export default function InitProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized, error, canShowContent, isMounted } = useInit();

  if (!isMounted) {
    return null;
  }

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

  return (
    <>
      {!canShowContent && <LoadingScreen />}
      {isInitialized && children}
    </>
  );
}