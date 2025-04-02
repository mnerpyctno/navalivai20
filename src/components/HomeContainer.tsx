'use client';

import styles from '@/styles/Home.module.css';
import Header from '@/components/Header';
import HomeContent from '@/components/HomeContent';

// Логирование импорта стилей
console.log('[HomeContainer] Импорт стилей:', {
  stylesLoaded: !!styles,
  stylesKeys: Object.keys(styles),
  containerStyle: styles.container
});

export default function HomeContainer() {
  console.log('[HomeContainer] Рендеринг компонента');
  return (
    <div className={styles.container}>
      <Header />
      <HomeContent />
    </div>
  );
} 