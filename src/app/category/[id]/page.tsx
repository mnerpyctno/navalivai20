'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Product, getProducts } from '../../../lib/api';
import Header from '../../../components/Header';
import styles from '../../../styles/Category.module.css';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts(categoryId);
        setProducts(productsData);
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

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

  if (products.length === 0) {
    return (
      <main className={styles.main}>
        <Header />
        <div className={styles.emptyState}>
          <h2>Товары не найдены</h2>
          <p>В данной категории пока нет товаров</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.container}>
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
      </div>
    </main>
  );
} 