'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FiSearch, FiUser, FiShoppingCart, FiHome, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/context/CartContext';
import styles from '@/styles/Header.module.css';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { cart } = useCart();
  const isHomePage = pathname === '/';
  
  const cartItemsCount = cart.reduce((total: number, item: CartItem) => total + item.quantity, 0);

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {isHomePage ? (
          <div className={styles.homeIcon}>
            <FiHome size={24} />
          </div>
        ) : (
          <button className={styles.backButton} onClick={handleBackClick}>
            <FiArrowLeft size={24} />
          </button>
        )}
        
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Поиск..."
          />
        </div>
        
        <div className={styles.userActions}>
          <button className={styles.iconButton}>
            <FiUser />
          </button>
          
          <button 
            className={`${styles.iconButton} ${styles.cartButton}`}
            onClick={() => router.push('/cart')}
          >
            <FiShoppingCart />
            {cartItemsCount > 0 && (
              <span className={styles.cartCount}>{cartItemsCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 