'use client';

import styles from '@/styles/Home.module.css';
import Header from '@/components/Header';
import HomeContent from './HomeContent';

export default function HomeContainer() {
  return (
    <div className={styles.container}>
      <Header />
      <HomeContent />
    </div>
  );
} 