'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../styles/Header.module.css';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft, faSearch, faUser, faShoppingCart, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const initialMount = useRef(true);
  const lastQuery = useRef('');
  const searchInProgress = useRef(false);

  // Инициализация значения поиска из URL только при первом рендере
  useEffect(() => {
    if (initialMount.current) {
      const currentQuery = searchParams.get('q') || '';
      setSearchQuery(currentQuery);
      lastQuery.current = currentQuery;
      initialMount.current = false;
    }
  }, [searchParams]);

  // Обработка изменений поискового запроса
  useEffect(() => {
    if (!initialMount.current && !searchInProgress.current) {
      const trimmedQuery = debouncedSearchQuery.trim();
      
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (trimmedQuery && trimmedQuery !== lastQuery.current) {
        setIsSearching(true);
        lastQuery.current = trimmedQuery;
        searchInProgress.current = true;
        
        searchTimeoutRef.current = setTimeout(() => {
          if (!isNavigating.current) {
            isNavigating.current = true;
            router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
          }
        }, 300);
      } 
      else if (!trimmedQuery && pathname === '/search') {
        router.push('/');
      }
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [debouncedSearchQuery, router, pathname]);

  // Сброс состояния поиска при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      isNavigating.current = false;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery && trimmedQuery !== lastQuery.current) {
      setIsSearching(true);
      lastQuery.current = trimmedQuery;
      
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        if (!isNavigating.current) {
          isNavigating.current = true;
          router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
        }
      }, 500);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    isNavigating.current = false;
    lastQuery.current = '';
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    if (pathname === '/search') {
      router.push('/');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    isNavigating.current = false;
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