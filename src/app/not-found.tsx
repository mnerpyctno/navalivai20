'use client';

import Link from 'next/link';
import styles from '@/styles/NotFound.module.css';

export default function NotFound() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>404</h1>
          <h2 className={styles.subtitle}>Страница не найдена</h2>
          <p className={styles.description}>
            Упс! Похоже, что страница, которую вы ищете, не существует или была перемещена.
          </p>
          <Link href="/" className={styles.button}>
            Вернуться на главную
          </Link>
        </div>
      </div>
    </main>
  );
} 