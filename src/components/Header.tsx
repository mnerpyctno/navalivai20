'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.homeLink}>
        <Image 
          src="/home.svg" 
          alt="Главная" 
          width={24} 
          height={24}
        />
      </Link>
      
      <div className={styles.searchBox}>
        <Image 
          src="/search.svg" 
          alt="Поиск" 
          width={24} 
          height={24}
          className={styles.searchIcon}
        />
        <input 
          type="text" 
          placeholder="Найти товар..." 
          className={styles.searchInput}
        />
      </div>

      <div className={styles.actions}>
        <Link href="/profile" className={styles.actionLink}>
          <Image 
            src="/profile.svg" 
            alt="Профиль" 
            width={24} 
            height={24}
          />
        </Link>
        <Link href="/cart" className={styles.actionLink}>
          <Image 
            src="/cart.svg" 
            alt="Корзина" 
            width={24} 
            height={24}
          />
        </Link>
      </div>
    </header>
  );
} 