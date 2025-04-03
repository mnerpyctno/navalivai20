'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from '@/styles/Home.module.css';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { productsApi } from '@/lib/api';
import { Product } from '@/types/product';
import { ITEMS_PER_PAGE } from '@/config/constants';

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
  const searchCache = useRef<Record<string, { products: Product[], total: number, timestamp: number }>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(false);
  const searchInProgress = useRef(false);
  const initialMount = useRef(true);
  const lastQuery = useRef('');
  const CACHE_TTL = 5 * 60 * 1000; // 5 минут

  // Инициализация компонента
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Сброс состояния при изменении поискового запроса
  useEffect(() => {
    if (!initialMount.current) {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      if (query !== lastQuery.current) {
        setProducts([]);
        setTotal(0);
        setHasMore(true);
        setPage(1);
        setLoading(true);
        setIsInitialLoad(true);
        searchInProgress.current = false;
        lastQuery.current = query;
        
        if (!query) {
          loadingTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
              setLoading(false);
              setIsInitialLoad(false);
            }
          }, 300);
        }
      }
    } else {
      initialMount.current = false;
      lastQuery.current = query;
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
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

      const cacheKey = `${query}:${pageNumber}`;
      const cached = searchCache.current[cacheKey];
      const now = Date.now();

      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        if (isMounted.current) {
          setProducts(cached.products);
          setTotal(cached.total);
          setHasMore(cached.total > ITEMS_PER_PAGE);
          setLoading(false);
          setIsInitialLoad(false);
        }
        return;
      }

      const response = await productsApi.getProducts({
        limit: ITEMS_PER_PAGE,
        offset: (pageNumber - 1) * ITEMS_PER_PAGE,
        searchQuery: query
      });
      
      if (!isMounted.current) return;
      
      const newProducts = response.rows.map(product => ({
        id: product.id,
        name: product.name,
        price: product.salePrices?.[0]?.value ? product.salePrices[0].value / 100 : 0,
        image: product.images?.rows?.[0]?.miniature?.href || '/default-product.jpg',
        description: product.description || '',
        categoryId: product.productFolder?.meta?.href?.split('/').pop() || '',
        available: true,
        stock: 0
      }));
      
      if (pageNumber === 1) {
        setProducts(newProducts);
        searchCache.current[cacheKey] = {
          products: newProducts,
          total: response.meta?.size || 0,
          timestamp: now
        };
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      setTotal(response.meta?.size || 0);
      setHasMore((response.meta?.size || 0) > pageNumber * ITEMS_PER_PAGE);
    } catch (error) {
      if (isMounted.current) {
        setError('Ошибка при загрузке товаров');
        console.error('Ошибка при загрузке товаров:', error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setIsInitialLoad(false);
        searchInProgress.current = false;
      }
    }
  }, [query]);

  useEffect(() => {
    if (query && !searchInProgress.current) {
      loadProducts(page);
    } else if (!query) {
      setLoading(false);
      setError(null);
      setIsInitialLoad(false);
    }
  }, [query, page, loadProducts]);

  // Очистка кэша при размонтировании
  useEffect(() => {
    return () => {
      searchCache.current = {};
    };
  }, []);

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
        {loading && isInitialLoad ? (
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
      {(loading || hasMore) && !error && !isInitialLoad && (
        <div ref={loadingRef} className={styles.loading}>
          <div className={styles.spinner} />
          <p>Загрузка товаров...</p>
        </div>
      )}
    </main>
  );
} 