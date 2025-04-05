import styles from '@/styles/Cart.module.css';

interface ImagePlaceholderProps {
  className?: string;
}

export default function ImagePlaceholder({ className }: ImagePlaceholderProps) {
  return (
    <div className={`${styles.placeholder} ${className || ''}`}>
      Фото
      <br />
      товара
    </div>
  );
} 