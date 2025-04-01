'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '@/styles/Home.module.css';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { fetchProducts } from '@/utils/api';
import { Product } from '@/types/product';

const ITEMS_PER_PAGE = 10;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);

  // Сброс состояния при изменении поискового запроса
  useEffect(() => {
    setProducts([]);
    setTotal(0);
    setHasMore(true);
    setPage(1);
    setLoading(true);
  }, [query]);

  const loadingRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        setPage(prev => prev + 1);
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const searchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchProducts(undefined, page, ITEMS_PER_PAGE, query);
        
        // Сохраняем позицию скролла перед обновлением состояния
        const scrollPosition = window.scrollY;
        
        if (page === 1) {
          setProducts(response.products);
        } else {
          setProducts(prev => [...prev, ...response.products]);
        }
        setTotal(response.total);
        setHasMore(response.products.length === ITEMS_PER_PAGE);
        
        // Восстанавливаем позицию скролла после обновления состояния
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPosition);
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Произошла ошибка при поиске');
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      searchProducts();
    } else {
      setLoading(false);
      setError(null);
    }
  }, [query, page]);

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
      <div className={styles.productsGrid}>
        {loading && page === 1 ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
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
      </div>
      {(loading || hasMore) && !error && (
        <div ref={loadingRef} className={styles.loading}>
          <div className={styles.spinner} />
          <p>Загрузка товаров...</p>
        </div>
      )}
    </main>
  );
} 