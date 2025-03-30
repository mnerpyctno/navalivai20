'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchProducts, fetchCategories } from '@/utils/api';
import { Product } from '@/types/product';
import Header from '@/components/Header';
import styles from '@/styles/Home.module.css';

interface Category {
  id: string;
  name: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts('', 1, 4),
          fetchCategories()
        ]);
        setProducts(productsData.products);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categoryImages: Record<string, string> = {
    'Жидкости': '/Жидкости.png',
    'Одноразки': '/Одноразки.png',
    'Расходники': '/Расходники.png',
    'Снюс': '/Снюс.png',
    'Устройства': '/Устройства.png',
    'Еда и напитки': '/Еда и напитки.png'
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Header />
      
      <h2 className={styles.sectionTitle}>Категории</h2>
      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <Link 
            href={`/category/${category.id}`} 
            key={category.id} 
            className={styles.categoryCard}
          >
            <div className={styles.categoryImageWrapper}>
              <Image 
                src={categoryImages[category.name] || '/placeholder.png'}
                alt={category.name}
                width={100}
                height={100}
                className={styles.categoryImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.png';
                }}
              />
            </div>
            <div className={styles.categoryName}>{category.name}</div>
          </Link>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>Популярные товары</h2>
      <div className={styles.productsGrid}>
        {products.map(product => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImageContainer}>
              <Image 
                src={product.image || '/placeholder.png'} 
                alt={product.name} 
                fill
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
              <button className={styles.addToCartButton}>
                В корзину
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
