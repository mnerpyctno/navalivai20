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
  image: string;
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

  const loadProducts = useCallback(async (pageNumber: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsApi.getProducts({
        limit: ITEMS_PER_PAGE,
        offset: (pageNumber - 1) * ITEMS_PER_PAGE,
        categoryId: selectedCategory || undefined,
        searchQuery: searchQuery || undefined
      });
      
      const products = await Promise.all(response.rows.map(async product => {
        const stockResponse = await productsApi.getProductStock(product.id);
        const totalQuantity = stockResponse?.rows?.reduce((sum: number, row: any) => {
          const quantity = typeof row.quantity === 'number' ? row.quantity : 0;
          return sum + quantity;
        }, 0) || 0;

        return {
          id: product.id,
          name: product.name,
          price: product.salePrices?.[0]?.value ? product.salePrices[0].value / 100 : 0,
          image: product.images?.rows?.[0]?.miniature?.href || '/default-product.jpg',
          description: product.description || '',
          categoryId: product.productFolder?.meta?.href?.split('/').pop() || '',
          available: totalQuantity > 0,
          stock: totalQuantity
        };
      }));
      
      if (pageNumber === 1) {
        setProducts(products);
      } else {
        setProducts(prev => [...prev, ...products]);
      }
      setHasMore((response.meta?.size || 0) > pageNumber * ITEMS_PER_PAGE);
      setTotal(response.meta?.size || 0);
    } catch (error) {
      setError('Ошибка при загрузке товаров');
      console.error('[Home] Ошибка при загрузке товаров:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

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
    loadProducts(1);
  }, [selectedCategory, searchQuery, loadProducts]);

  useEffect(() => {
    if (page > 1) {
      loadProducts(page);
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
                src={category.image}
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