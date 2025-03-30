'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchProducts } from '@/utils/api';
import { Product } from '@/types/product';
import Header from '@/components/Header';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProducts('', 1, 4);
        setProducts(data.products);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categoryData = [
    { name: 'Жидкости', image: '/Жидкости.png', id: '1' },
    { name: 'Одноразки', image: '/Одноразки.png', id: '2' },
    { name: 'Расходники', image: '/Расходники.png', id: '3' },
    { name: 'Снюс', image: '/Снюс.png', id: '4' },
    { name: 'Устройства', image: '/Устройства.png', id: '5' },
    { name: 'Еда и напитки', image: '/Еда и напитки.png', id: '6' }
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
            href={`/category/${category.id}`} 
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
