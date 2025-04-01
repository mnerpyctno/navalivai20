import styles from '@/styles/ImagePlaceholder.module.css';

interface ImagePlaceholderProps {
  className?: string;
}

export default function ImagePlaceholder({ className }: ImagePlaceholderProps) {
  return (
    <div className={`${styles.placeholder} ${className || ''}`}>
      <div className={styles.content}>
        <span className={styles.text}>NO PHOTO</span>
      </div>
    </div>
  );
} 