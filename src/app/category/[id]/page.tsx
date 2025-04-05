'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import styles from '@/styles/Category.module.css';
import { Product } from '@/types/product';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { ITEMS_PER_PAGE } from '@/config/constants';
import ProductCard from '@/components/ProductCard';
import { env } from '@/config/env';

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');
  const [totalProducts, setTotalProducts] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const { addToCart } = useCart();

  const loadProducts = useCallback(async (pageNumber: number) => {
    try {
      const response = await fetch(`${env.API_URL}/api/products?categoryId=${params.id}&limit=${ITEMS_PER_PAGE}&offset=${(pageNumber - 1) * ITEMS_PER_PAGE}`);
      if (!response.ok) {
        throw new Error('Ошибка при загрузке товаров');
      }
      const data = await response.json();
      
      const newProducts = data.rows.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        available: product.available,
        stock: product.stock,
        article: product.article || '',
        weight: product.weight || 0,
        volume: product.volume || 0,
        isArchived: product.isArchived || false
      }));
      
      setProducts(prev => pageNumber === 1 ? newProducts : [...prev, ...newProducts]);
      setHasMore((data.meta?.size || 0) > pageNumber * ITEMS_PER_PAGE);
      setTotalProducts(data.meta?.size || 0);
      
      if (newProducts.length > 0 && !categoryName) {
        setCategoryName(newProducts[0].categoryName);
      }
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
      setError('Ошибка при загрузке товаров');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [params.id, categoryName]);

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
        <div className={styles.noResults}>
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
        <div className={styles.header}>
          <h1 className={styles.title}>{categoryName} ({totalProducts})</h1>
        </div>
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              categoryName={categoryName}
            />
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