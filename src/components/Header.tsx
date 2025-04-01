'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../styles/Header.module.css';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft, faSearch, faUser, faShoppingCart, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export default function Header() {
  const { items } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Обновляем URL при изменении поискового запроса
  useEffect(() => {
    if (pathname === '/search') {
      const currentQuery = new URLSearchParams(window.location.search).get('q') || '';
      if (currentQuery !== searchQuery) {
        setSearchQuery(currentQuery);
      }
    }
  }, [pathname]);

  // Обновляем URL при изменении поискового запроса с задержкой
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(debouncedSearchQuery.trim())}`);
    } else if (pathname === '/search') {
      router.push('/search');
    }
  }, [debouncedSearchQuery, router, pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (pathname === '/search') {
      router.push('/search');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.leftActions}>
          {pathname === '/' ? (
            <Link href="/" className={styles.actionButton}>
              <FontAwesomeIcon icon={faHome} size="lg" />
            </Link>
          ) : (
            <Link href="/" className={styles.actionButton}>
              <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            </Link>
          )}
        </div>
        
        <form onSubmit={handleSearch} className={styles.searchBox}>
          <FontAwesomeIcon 
            icon={faSearch} 
            className={styles.searchIcon}
          />
          <input 
            type="text" 
            placeholder="Найти товар..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClearSearch}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </form>

        <div className={styles.rightActions}>
          <Link href="/profile" className={styles.actionButton}>
            <FontAwesomeIcon icon={faUser} size="lg" />
          </Link>
          <Link href="/cart" className={styles.actionButton}>
            <div className={styles.cartIconWrapper}>
              <FontAwesomeIcon icon={faShoppingCart} size="lg" />
              {totalItems > 0 && (
                <span className={styles.cartBadge}>{totalItems}</span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
} 