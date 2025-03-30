'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Category, Product, getProductGroups, getProducts } from '../lib/api';
import Header from '../components/Header';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          getProductGroups(),
          getProducts()
        ]);
        setCategories(categoriesData);
        setProducts(productsData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const defaultCategories = [
    'Еда и напитки',
    'Жидкости',
    'Одноразки',
    'Расходники',
    'Снюс',
    'Устройства'
  ];

  return (
    <main className={styles.main}>
      <Header />
      
      <h2 className={styles.sectionTitle}>Категории</h2>
      <div className={styles.categoriesGrid}>
        {defaultCategories.map((name) => (
          <Link 
            href={`/category/${categories.find(cat => cat.name === name)?.id || ''}`} 
            key={name} 
            className={styles.categoryCard}
          >
            {name}
          </Link>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>Популярные товары</h2>
      <div className={styles.productsGrid}>
        {products.slice(0, 4).map(product => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImageContainer}>
              <Image 
                src={product.image} 
                alt={product.name} 
                width={200}
                height={200}
                className={styles.productImage} 
              />
            </div>
            <div className={styles.productInfo}>
              <h3>{product.name}</h3>
              <p className={styles.price}>{product.price} BYN</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
