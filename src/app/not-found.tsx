'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import styles from '@/styles/NotFound.module.css';

export default function NotFound() {
  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>404</h1>
          <h2 className={styles.subtitle}>Страница не найдена</h2>
          <p className={styles.description}>
            К сожалению, запрашиваемая страница не существует или была перемещена.
            Вы можете вернуться на главную страницу и продолжить покупки.
          </p>
          <Link href="/" className={styles.button}>
            Вернуться на главную
          </Link>
        </div>
      </div>
    </main>
  );
} 