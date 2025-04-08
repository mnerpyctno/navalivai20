'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from '@/styles/Home.module.css';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product'; // Исправлен импорт
import { ITEMS_PER_PAGE } from '../../../config/constants'; // Исправлен импорт
import { env } from '../../../server/src/config/env'; // Исправлен импорт
import LoadingScreen from '@/components/LoadingScreen';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);
  const searchInProgress = useRef(false);

  // Инициализация компонента
  useEffect(() => {
    isMounted.current = true;
    // Загружаем результаты поиска при монтировании компонента
    if (query) {
      loadProducts(1);
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Сброс состояния при изменении поискового запроса
  useEffect(() => {
    if (query) {
      setProducts([]);
      setTotal(0);
      setHasMore(true);
      setPage(1);
      setLoading(true);
      searchInProgress.current = false;
      loadProducts(1);
    } else {
      setLoading(false);
      setError(null);
    }
  }, [query]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore && !searchInProgress.current) {
        setPage(prev => prev + 1);
      }
    }, options);

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore]);

  const loadProducts = useCallback(async (pageNumber: number) => {
    if (searchInProgress.current || !query) return;
    
    try {
      searchInProgress.current = true;
      setLoading(true);
      setError(null);

      const offset = (pageNumber - 1) * ITEMS_PER_PAGE;
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=${ITEMS_PER_PAGE}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке товаров');
      }

      const data = await response.json();
      
      if (!isMounted.current) return;
      
      const newProducts = data.rows.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId || '',
        categoryName: product.categoryName || '',
        available: product.available,
        stock: product.stock || 0
      }));
      
      if (pageNumber === 1) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      setTotal(data.meta.size);
      setHasMore(data.meta.offset + data.meta.limit < data.meta.size);
    } catch (error) {
      if (isMounted.current) {
        setError('Ошибка при загрузке товаров');
        console.error('Ошибка при загрузке товаров:', error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        searchInProgress.current = false;
      }
    }
  }, [query]);

  useEffect(() => {
    if (query) {
      loadProducts(1);
    }
  }, [query, loadProducts]); // Added loadProducts to dependency array

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]); // This is correctly defined now

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className={styles.main}>
      <Header />
      {query && (
        <div className={styles.searchHeader}>
          <h1 className={styles.title}>Результаты поиска</h1>
          <p className={styles.searchCount}>
            Найдено товаров: {total}
          </p>
        </div>
      )}
      {loading && page === 1 ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Поиск товаров...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : products.length > 0 ? (
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          {query ? (
            <>
              <p>По вашему запросу &quot;{query}&quot; ничего не найдено</p>
              <p>Попробуйте изменить поисковый запрос или использовать другие ключевые слова</p>
            </>
          ) : (
            <>
              <p>Введите поисковый запрос в строку поиска</p>
              <p>Например: &quot;название товара&quot; или &quot;категория&quot;</p>
            </>
          )}
        </div>
      )}
      {(loading || hasMore) && !error && page > 1 && (
        <div ref={loadingRef} className={styles.loading}>
          <div className={styles.spinner} />
          <p>Загрузка товаров...</p>
        </div>
      )}
    </main>
  );
}