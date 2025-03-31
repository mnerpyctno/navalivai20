import Image from 'next/image';
import styles from '@/styles/CategoryCard.module.css';
import { Category } from '@/data/categories';

interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

export default function CategoryCard({ category, isSelected, onClick }: CategoryCardProps) {
  return (
    <button
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.imageWrapper}>
        <Image
          src={category.image}
          alt={category.name}
          width={80}
          height={80}
          className={styles.image}
        />
      </div>
      <span className={styles.name}>{category.name}</span>
    </button>
  );
} 