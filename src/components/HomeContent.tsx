'use client';

import styles from '@/styles/Home.module.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { productsApi } from '@/lib/api';
import { ITEMS_PER_PAGE } from '@/config/constants';
import { Product } from '@/types/product';

interface Category {
  id: string;
  name: string;
  image: string | null;
}

export default function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);

  const categoryImages: Record<string, string> = {
    'Жидкости': '/Жидкости.png',
    'Одноразки': '/Одноразки.png',
    'Расходники': '/Расходники.png',
    'Снюс': '/Снюс.png',
    'Устройства': '/Устройства.png',
    'Еда и напитки': '/Еда и напитки.png'
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsApi.getProducts({
        categoryId: selectedCategory,
        searchQuery: searchQuery,
        offset: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE
      });

      const newProducts = response.rows.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.salePrices?.[0]?.value ? product.salePrices[0].value / 100 : 0,
        image: product.images?.rows?.[0]?.miniature?.href || '/default-product.jpg',
        categoryId: product.categoryId || '',
        available: true,
        stock: 0
      }));

      setProducts(prev => {
        const productMap = new Map(prev.map(p => [p.id, p]));
        newProducts.forEach(product => {
          productMap.set(product.id, product);
        });
        return Array.from(productMap.values());
      });
      
      setHasMore(response.meta.size > (page * ITEMS_PER_PAGE));
    } catch (error) {
      console.error('[Home] Ошибка при загрузке товаров:', error);
      setError('Ошибка при загрузке товаров');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, page]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await productsApi.getCategories();
      const categories = response.rows.map(category => ({
        id: category.id,
        name: category.name,
        image: categoryImages[category.name] || '/placeholder.png'
      }));
      setCategories(categories);
    } catch (error) {
      console.error('[Home] Ошибка при загрузке категорий:', error);
      setError('Ошибка при загрузке категорий');
    }
  }, [categoryImages]);

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
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    setPage(1);
    loadProducts();
  }, [selectedCategory, searchQuery, loadProducts]);

  useEffect(() => {
    if (page > 1) {
      loadProducts();
    }
  }, [page, loadProducts]);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Категории</h1>
      </div>

      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.id}`}
            className={`${styles.categoryCard} ${selectedCategory === category.id ? styles.selected : ''}`}
          >
            <div className={styles.categoryImageWrapper}>
              <Image
                src={category.image || '/placeholder.png'}
                alt={category.name}
                fill
                className={styles.categoryImage}
                sizes="(max-width: 480px) 50vw, 33vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.png';
                }}
              />
            </div>
            <span className={styles.categoryName}>{category.name}</span>
          </Link>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>Все товары</h2>
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {(loading || hasMore) && (
        <div ref={loadingRef} className={styles.loading}>
          <div className={styles.spinner} />
          <p>Загрузка товаров...</p>
        </div>
      )}
    </main>
  );
} 