'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.container}>
        <section className={styles.categories}>
          <h2 className={styles.sectionTitle}>Категории</h2>
          <div className={styles.categoriesGrid}>
            {categories.map(category => (
              <div key={category.id} className={styles.categoryCard}>
                <h3>{category.name}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.products}>
          <h2 className={styles.sectionTitle}>Популярные товары</h2>
          <div className={styles.productsGrid}>
            {products.map(product => (
              <div key={product.id} className={styles.productCard}>
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  width={200}
                  height={200}
                  className={styles.productImage} 
                />
                <div className={styles.productInfo}>
                  <h3>{product.name}</h3>
                  <p className={styles.price}>{product.price} BYN</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
