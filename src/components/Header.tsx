'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FiSearch, FiUser, FiShoppingCart, FiHome, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/context/CartContext';
import styles from '@/styles/Header.module.css';
import Link from 'next/link';
import Image from 'next/image';

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
        
        <div className={styles.searchContainer}>
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
        </div>
        
        <div className={styles.userActions}>
          <Link href="/profile" className={styles.iconButton}>
            <Image 
              src="/profile.svg" 
              alt="Профиль" 
              width={24} 
              height={24}
            />
          </Link>
          
          <Link href="/cart" className={styles.iconButton}>
            <Image 
              src="/cart.svg" 
              alt="Корзина" 
              width={24} 
              height={24}
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 