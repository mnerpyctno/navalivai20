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

  const categoryData = [
    { name: 'Жидкости', image: '/Жидкости.png' },
    { name: 'Одноразки', image: '/Одноразки.png' },
    { name: 'Расходники', image: '/Расходники.png' },
    { name: 'Снюс', image: '/Снюс.png' },
    { name: 'Устройства', image: '/Устройства.png' },
    { name: 'Энергетики', image: '/Энергетики.png' }
  ];

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
        {categoryData.map((category) => (
          <Link 
            href={`/category/${categories.find(cat => cat.name === category.name)?.id || ''}`} 
            key={category.name} 
            className={styles.categoryCard}
          >
            <div className={styles.categoryImageWrapper}>
              <Image 
                src={category.image}
                alt={category.name}
                width={100}
                height={100}
                className={styles.categoryImage}
              />
            </div>
            <div className={styles.categoryName}>{category.name}</div>
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
