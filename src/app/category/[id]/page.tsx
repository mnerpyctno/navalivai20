'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from '@/styles/Category.module.css';
import { fetchProducts } from '@/utils/api';
import { Product } from '@/types/product';
import Header from '@/components/Header';

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const loadProducts = useCallback(async (pageNumber: number) => {
    try {
      setLoading(true);
      const data = await fetchProducts(params.id, pageNumber);
      setProducts(prev => pageNumber === 1 ? data.products : [...prev, ...data.products]);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  useEffect(() => {
    const currentObserver = observer.current;
    if (currentObserver) {
      currentObserver.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
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
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      loadProducts(page);
    }
  }, [page, loadProducts]);

  if (error) {
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
                />
              </div>
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.price}>{product.price} ₽</p>
                <button className={styles.addToCartButton}>
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
        {(loading || hasMore) && (
          <div ref={loadingRef} className={styles.loading}>
            <div className={styles.spinner} />
            <p>Загрузка товаров...</p>
          </div>
        )}
      </div>
    </main>
  );
} 