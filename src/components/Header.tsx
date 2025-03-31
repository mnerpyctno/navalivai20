'use client';

import Link from 'next/link';
import styles from '../styles/Header.module.css';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft, faSearch, faUser, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  const { items } = useCart();
  const pathname = usePathname();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

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
        
        <div className={styles.searchBox}>
          <FontAwesomeIcon 
            icon={faSearch} 
            className={styles.searchIcon}
          />
          <input 
            type="text" 
            placeholder="Найти товар..." 
            className={styles.searchInput}
          />
        </div>

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