'use client';

import styles from './HomeContent.module.css';
import ProductCard from './ProductCard';
import { useHomeContent } from '@/hooks/useHomeContent';
import { CategoryCard } from './CategoryCard';
import { Spinner } from './Spinner';
import { ErrorMessage } from './ErrorMessage';

interface Category {
  id: string;
  name: string;
  image: string;
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

export const HomeContent = () => {
  const { products, categories, loading, error } = useHomeContent();

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.categories}>
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            id={category.id}
            name={category.name}
            image={category.image}
          />
        ))}
      </div>

      <div className={styles.products}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
};