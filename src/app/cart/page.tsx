'use client';

import { useCart } from '../../context/CartContext';
import Header from '../../components/Header';
import styles from '../../styles/Cart.module.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <main className={styles.main}>
        <Header />
        <div className={styles.emptyCart}>
          <h2>Корзина пуста</h2>
          <p>Добавьте товары в корзину</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Корзина</h1>
        
        <div className={styles.cartItems}>
          {cart.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <img src={item.image} alt={item.name} className={styles.itemImage} />
              <div className={styles.itemInfo}>
                <h3>{item.name}</h3>
                <p className={styles.price}>{item.price} BYN</p>
              </div>
              <div className={styles.itemActions}>
                <div className={styles.quantity}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className={styles.quantityButton}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className={styles.quantityButton}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className={styles.removeButton}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <div className={styles.total}>
            <span>Итого:</span>
            <span className={styles.totalAmount}>{total.toFixed(2)} BYN</span>
          </div>
          <button className={styles.checkoutButton}>
            Оформить заказ
          </button>
        </div>
      </div>
    </main>
  );
} 