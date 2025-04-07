'use client';

import styles from '@/styles/Home.module.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';
<<<<<<< HEAD
import { getApiUrl } from '@/config/env';
import { getProducts, getCategories } from '@/lib/api';
=======
>>>>>>> 403f6ea (Last version)

interface Category {
  id: string;
  name: string;
  image: string | null;
}

const categoryImages: Record<string, string> = {
  'Жидкости': '/Жидкости.png',
  'Одноразки': '/Одноразки.png',
  'Расходники': '/Расходники.png',
  'Снюс': '/Снюс.png',
  'Устройства': '/Устройства.png',
  'Еда и напитки': '/Еда и напитки.png'
};

// Глобальный флаг для отслеживания первого залогированного продукта
let hasLoggedFirstProduct = false;

export default function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
<<<<<<< HEAD
  const [totalProducts, setTotalProducts] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
=======
  const observer = useRef<IntersectionObserver | null>(null);
>>>>>>> 403f6ea (Last version)

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
<<<<<<< HEAD
      const data = await getProducts('', page);
      
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

      setProducts(prev => page === 1 ? newProducts : [...prev, ...newProducts]);
      setTotalProducts(data.meta.size);
      setHasMore(data.meta.offset + data.meta.limit < data.meta.size);
=======
      const response = await fetch(`/api/products?limit=24&offset=${(page - 1) * 24}`);
      if (!response.ok) throw new Error('Failed to load products');
      const data = await response.json();
      
      const newProducts = data.rows.map((product: any, index: number) => {
        if (index === 0 && !hasLoggedFirstProduct) {
          hasLoggedFirstProduct = true;
          console.log('🎯 Product data from server:', {
            productId: product.id,
            productName: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            timestamp: new Date().toISOString()
          });
        }
        
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId || '',
          categoryName: product.categoryName || '',
          available: product.available,
          stock: product.stock || 0
        };
      });

      setProducts(prev => {
        const productMap = new Map(prev.map(p => [p.id, p]));
        newProducts.forEach((product: Product) => {
          productMap.set(product.id, product);
        });
        return Array.from(productMap.values());
      });
      
      setHasMore(data.rows.length === 24);
>>>>>>> 403f6ea (Last version)
    } catch (error) {
      console.error('[Home] Ошибка при загрузке товаров:', error);
      setError('Ошибка при загрузке товаров');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadCategories = useCallback(async () => {
    try {
<<<<<<< HEAD
      const data = await getCategories();
=======
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to load categories');
      const data = await response.json();
>>>>>>> 403f6ea (Last version)
      
      // Обрабатываем оба формата ответа: с rows и без
      const categoriesData = Array.isArray(data) ? data : (data.rows || []);
      
      const categories = categoriesData.map((category: any) => ({
        id: category.id,
        name: category.name,
        image: categoryImages[category.name] || '/placeholder.png'
      }));
      
      setCategories(categories);
    } catch (error) {
      console.error('[Home] Ошибка при загрузке категорий:', error);
      setError('Ошибка при загрузке категорий');
    }
  }, []);

<<<<<<< HEAD
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
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

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

=======
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
    loadProducts();
  }, [loadProducts]);

>>>>>>> 403f6ea (Last version)
  if (loading && products.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
<<<<<<< HEAD
        <p>Загрузка товаров...</p>
      </div>
    );
  }

=======
      </div>
    );
  }
>>>>>>> 403f6ea (Last version)
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.main}>
      <div className="contentContainer">
        <div className={styles.header}>
          <h1 className={styles.title}>Категории</h1>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className={styles.categoryCard}
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

<<<<<<< HEAD
        <h2 className={styles.sectionTitle}>Все товары ({totalProducts})</h2>
=======
        <h2 className={styles.sectionTitle}>Все товары</h2>
>>>>>>> 403f6ea (Last version)
        <div className={styles.productsGrid}>
          {products.map((product) => {
            const category = categories.find(cat => cat.id === product.categoryId);
            return (
              <ProductCard 
                key={product.id} 
                product={product} 
                categoryName={category?.name}
              />
            );
          })}
        </div>

        {(loading || hasMore) && (
          <div ref={loadingRef} className={styles.loading}>
            <div className={styles.spinner} />
            <p>Загрузка товаров...</p>
          </div>
        )}
      </div>
    </div>
  );
} 