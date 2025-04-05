import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/CategoryCard.module.css';

interface CategoryCardProps {
  id: number;
  name: string;
  image: string;
}

export default function CategoryCard({ id, name, image }: CategoryCardProps) {
  return (
    <Link href={`/category/${id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={image}
          alt={name}
          width={300}
          height={300}
          className={styles.image}
        />
      </div>
      <h3 className={styles.name}>{name}</h3>
    </Link>
  );
} 