'use client';

import styles from '@/styles/Home.module.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from './ProductCard';
import { useHomeContent } from '@/hooks/useHomeContent';
import { CategoryCard } from './CategoryCard';
import { Spinner } from './Spinner';
import { ErrorMessage } from './ErrorMessage';

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

const useHomeContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error('[Home] Ошибка при загрузке товаров:', error);
      setError('Ошибка при загрузке товаров');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      
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

  return {
    products,
    categories,
    loading,
    hasMore,
    error,
    totalProducts,
    loadingRef
  };
};

export const HomeContent = () => {
  const { products, categories, isLoading, error } = useHomeContent();

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Категории</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              image={category.image}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Популярные товары</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
            />
          ))}
        </div>
      </section>
    </div>
  );
};