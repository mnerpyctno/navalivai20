'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from '@/styles/Category.module.css';
import { fetchProducts } from '@/utils/api';
import { Product } from '@/types/product';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const { addToCart } = useCart();

  const loadProducts = useCallback(async (pageNumber: number) => {
    try {
      const data = await fetchProducts(params.id, pageNumber);
      setProducts(prev => pageNumber === 1 ? data.products : [...prev, ...data.products]);
      setHasMore(data.hasMore);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке товаров:', err);
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
      setProducts(prev => pageNumber === 1 ? [] : prev);
    } finally {
      setLoading(false);
      if (pageNumber === 1) {
        setInitialLoad(false);
      }
    }
  }, [params.id]);

  useEffect(() => {
    setInitialLoad(true);
    setPage(1);
    loadProducts(1);
  }, [params.id, loadProducts]);

  useEffect(() => {
    if (!hasMore || loading || initialLoad) return;

    const currentObserver = observer.current;
    if (currentObserver) {
      currentObserver.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1);
      }
    });

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [hasMore, loading, initialLoad]);

  useEffect(() => {
    if (page > 1 && !initialLoad) {
      loadProducts(page);
    }
  }, [page, loadProducts, initialLoad]);

  if (initialLoad) {
    return (
      <main className={styles.main}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Загрузка товаров...</p>
        </div>
      </main>
    );
  }

  if (error && products.length === 0) {
    return (
      <main className={styles.main}>
        <Header />
        <div className={styles.emptyState}>
          <h2>Произошла ошибка</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!products || products.length === 0) {
    return (
      <main className={styles.main}>
        <Header />
        <div className={styles.emptyState}>
          <h2>Товары не найдены</h2>
          <p>В данной категории пока нет товаров</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.container}>
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImageContainer}>
                <Image
                  src={product.image || '/placeholder.png'}
                  alt={product.name}
                  fill
                  loading="lazy"
                  className={styles.productImage}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.png';
                  }}
                />
              </div>
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.price}>{product.price} BYN</p>
                <button 
                  className={styles.addToCartButton}
                  onClick={() => addToCart(product)}
                >
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
        {(loading || hasMore) && !error && (
          <div ref={loadingRef} className={styles.loading}>
            <div className={styles.spinner} />
            <p>Загрузка товаров...</p>
          </div>
        )}
      </div>
    </main>
  );
} 