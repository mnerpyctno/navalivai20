'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchProducts, fetchCategories } from '@/utils/api';
import styles from '@/styles/Home.module.css';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  categoryId: string | null;
  available: boolean;
  description?: string;
  code?: string;
  stock: number;
}

const ITEMS_PER_PAGE = 9;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(selectedCategory || undefined, page, ITEMS_PER_PAGE),
          fetchCategories()
        ]);
        setCategories(categoriesData);
        if (page === 1) {
          setProducts(productsData.products);
        } else {
          setProducts(prev => [...prev, ...productsData.products]);
        }
        setHasMore(productsData.hasMore);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, selectedCategory]);

  const categoryImages: Record<string, string> = {
    'Жидкости': '/Жидкости.png',
    'Одноразки': '/Одноразки.png',
    'Расходники': '/Расходники.png',
    'Снюс': '/Снюс.png',
    'Устройства': '/Устройства.png',
    'Еда и напитки': '/Еда и напитки.png'
  };

  return (
    <main className={styles.main}>
      <Header />
      
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
                src={categoryImages[category.name] || '/placeholder.png'}
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
        {products.map((product, index) => (
          <div
            key={product.id}
            ref={index === products.length - 1 ? lastProductRef : undefined}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Загрузка...</p>
        </div>
      )}
    </main>
  );
}
