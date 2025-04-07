'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../styles/Header.module.css';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft, faSearch, faUser, faShoppingCart, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchParams } from 'next/navigation';

export default function Header() {
  const { items } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const searchParams = useSearchParams();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigating = useRef(false);

  // Инициализация значения поиска из URL
  useEffect(() => {
    const currentQuery = searchParams.get('q') || '';
    if (currentQuery !== searchQuery) {
      setSearchQuery(currentQuery);
    }
  }, [searchParams, searchQuery]); // Добавлен searchQuery в массив зависимостей

  // Обработка изменений поискового запроса
  useEffect(() => {
    const trimmedQuery = debouncedSearchQuery.trim();
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (trimmedQuery.length >= 2) {
      setIsSearching(true);
      
      searchTimeoutRef.current = setTimeout(() => {
        if (!isNavigating.current) {
          isNavigating.current = true;
          const newPath = `/search?q=${encodeURIComponent(trimmedQuery)}`;
          if (pathname !== '/search' || searchParams.get('q') !== trimmedQuery) {
            router.push(newPath);
          }
          setIsSearching(false);
          isNavigating.current = false;
        }
      }, 500);
    } else if (pathname === '/search' && trimmedQuery.length < 2) {
      // Добавляем задержку перед перенаправлением на главную страницу
      searchTimeoutRef.current = setTimeout(() => {
        if (!isNavigating.current) {
          isNavigating.current = true;
          router.push('/');
          isNavigating.current = false;
        }
      }, 1000);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [debouncedSearchQuery, router, pathname, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery.length >= 2) {
      setIsSearching(true);
      
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        if (!isNavigating.current) {
          isNavigating.current = true;
          const newPath = `/search?q=${encodeURIComponent(trimmedQuery)}`;
          if (pathname !== '/search' || searchParams.get('q') !== trimmedQuery) {
            router.push(newPath);
          }
          setIsSearching(false);
          isNavigating.current = false;
        }
      }, 500);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    if (pathname === '/search') {
      // Добавляем задержку перед перенаправлением на главную страницу
      searchTimeoutRef.current = setTimeout(() => {
        if (!isNavigating.current) {
          isNavigating.current = true;
          router.push('/');
          isNavigating.current = false;
        }
      }, 1000);
    }
  };

  const handleBack = () => {
    if (!isNavigating.current) {
      isNavigating.current = true;
      router.push('/');
      isNavigating.current = false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
            <button onClick={handleBack} className={styles.actionButton}>
              <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSearch} className={styles.searchBox}>
          <FontAwesomeIcon 
            icon={isSearching ? faSpinner : faSearch} 
            className={`${styles.searchIcon} ${isSearching ? styles.spinning : ''}`}
          />
          <input 
            type="text" 
            placeholder="Найти товар..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={handleInputChange}
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
          <Link href="/cart" className={styles.cartIconWrapper}>
            <FontAwesomeIcon icon={faShoppingCart} size="lg" />
            {totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}