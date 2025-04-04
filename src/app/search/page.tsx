'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from '@/styles/Home.module.css';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';
import { ITEMS_PER_PAGE } from '@/config/constants';
import { env } from '@/config/env';

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

  const loadingRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && hasMore && !searchInProgress.current) {
        setPage(prev => prev + 1);
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    if (node) observer.current.observe(node);
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
      
      const newProducts = data.rows.map((product: any) => {
        // Находим цену продажи в массиве salePrices
        const retailPrice = product.salePrices?.find((price: any) => 
          price.priceType?.name === 'Цена продажи' || 
          price.priceType?.name === 'Розничная цена' ||
          price.priceType?.name === 'Цена'
        ) || product.salePrices?.[0];
        
        // Получаем значение цены и делим на 100 (копейки в рубли)
        const price = retailPrice?.value ? retailPrice.value / 100 : 0;
        
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: price,
          imageUrl: product.image || null,
          categoryId: product.categoryId || '',
          available: true,
          stock: 0
        };
      });
      
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
    if (query && !searchInProgress.current) {
      loadProducts(page);
    }
  }, [query, page, loadProducts]);

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
            <p>Поиск товаров...</p>
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
      {(loading || hasMore) && !error && page > 1 && (
        <div ref={loadingRef} className={styles.loading}>
          <div className={styles.spinner} />
          <p>Загрузка товаров...</p>
        </div>
      )}
    </main>
  );
} 