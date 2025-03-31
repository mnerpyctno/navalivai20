'use client';

import { useCart } from '@/context/CartContext';
import styles from '@/styles/Cart.module.css';
import Image from 'next/image';
import Header from '@/components/Header';

export default function Cart() {
  const { items, updateQuantity, removeFromCart } = useCart();

  const totalAmount = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  return (
    <>
      <Header />
      <div className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Ваша корзина</h1>
          <button className={styles.promoButton}>
            У меня есть промокод
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>Корзина пуста</h2>
            <p className={styles.emptyText}>Добавьте товары для оформления заказа</p>
          </div>
        ) : (
          <div className={styles.cartSection}>
            {items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.imageContainer}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className={styles.image}
                  />
                </div>
                <div className={styles.itemInfo}>
                  <div>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <div>
                      <span className={styles.itemPrice}>{item.price} Br</span>
                      {item.oldPrice && (
                        <span className={styles.oldPrice}>{item.oldPrice} Br</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.quantityButton}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      className={styles.quantityButton}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={!item.available}
                    >
                      +
                    </button>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeFromCart(item.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.bonusSection}>
          <h3 className={styles.bonusTitle}>За этот заказ вы получите</h3>
          <p className={styles.bonusText}>1 штамп в скидочную карту</p>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.total}>
            <span className={styles.totalLabel}>Итого:</span>
            <span className={styles.totalAmount}>{totalAmount} Br</span>
          </div>
          <button 
            className={`${styles.checkoutButton} ${items.length === 0 ? styles.checkoutButtonDisabled : ''}`}
            disabled={items.length === 0}
          >
            Оформить заказ
          </button>
        </div>
      </div>
    </>
  );
} 