'use client';

import { useCart } from '@/context/CartContext';
import styles from '@/styles/Cart.module.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import ErrorPopup from '@/components/ErrorPopup';
import ImagePlaceholder from '@/components/ImagePlaceholder';

export default function Cart() {
  const { items: cartItems, updateQuantity, removeFromCart, isLoading } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isBonusSectionOpen, setIsBonusSectionOpen] = useState(false);

  // Сброс состояния ошибок при изменении корзины
  useEffect(() => {
    setImageErrors({});
  }, [cartItems]);

  const totalItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    
    // Если URL содержит storage.files.mow1.cloud.servers.ru, используем прокси
    if (imageUrl.includes('storage.files.mow1.cloud.servers.ru')) {
      return `/api/images/${encodeURIComponent(imageUrl)}`;
    }
    
    // Если URL содержит api.moysklad.ru, используем прокси МойСклад
    if (imageUrl.includes('api.moysklad.ru')) {
      return `/api/moysklad/image?url=${encodeURIComponent(imageUrl)}`;
    }
    
    // Для остальных случаев возвращаем оригинальный URL
    return imageUrl;
  };

  const totalAmount = cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Расчет скидки на основе количества штампов
  const getDiscount = (stamps: number) => {
    if (stamps >= 10) return 10;
    if (stamps >= 5) return 2;
    return 0;
  };

  const discount = getDiscount(totalItemsCount);
  const finalAmount = totalAmount - discount;

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }
    
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Произошла ошибка при обновлении количества');
      }
    }
  };

  const handleAddStamp = async (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;

    if (item.quantity >= item.stock) {
      setError(`Товар "${item.name}" отсутствует в нужном количестве. Доступно: ${item.stock} шт.`);
      return;
    }

    await handleQuantityChange(itemId, item.quantity + 1);
  };

  const handleRemoveStamp = async (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;

    if (item.quantity === 1) {
      removeFromCart(itemId);
    } else {
      await handleQuantityChange(itemId, item.quantity - 1);
    }
  };

  const handleImageError = (id: string) => {
    console.error('Image loading error for item:', id);
    setImageErrors(prev => ({ ...prev, [id]: true }));
    // Попытка перезагрузки изображения через 1 секунду
    setTimeout(() => {
      setImageErrors(prev => ({ ...prev, [id]: false }));
    }, 1000);
  };

  const handleImageLoad = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: false }));
  };

  return (
    <>
      <Header />
      <div className={styles.main}>
        <div className={styles.cartSection}>
          {cartItems.length > 0 ? (
            <>
              <div className={styles.cartItems}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.imageContainer}>
                      {!imageErrors[item.id] && item.imageUrl ? (
                        <Image
                          src={getImageUrl(item.imageUrl) || ''}
                          alt={item.name}
                          width={90}
                          height={90}
                          className={styles.image}
                          onError={() => handleImageError(item.id)}
                          onLoad={() => handleImageLoad(item.id)}
                          unoptimized={true}
                        />
                      ) : (
                        <ImagePlaceholder />
                      )}
                    </div>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemHeader}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        <div className={styles.itemPrice}>{item.price} BYN</div>
                      </div>
                      <div className={styles.quantityControls}>
                        <button
                          className={styles.quantityButton}
                          onClick={() => handleRemoveStamp(item.id)}
                          disabled={isLoading}
                        >
                          -
                        </button>
                        <span className={styles.quantity}>{item.quantity}</span>
                        <button
                          className={styles.quantityButton}
                          onClick={() => handleAddStamp(item.id)}
                          disabled={isLoading}
                        >
                          +
                        </button>
                      </div>
                      {item.stock <= 5 && (
                        <div className={styles.stockInfo}>
                          Доступно: {item.stock} шт.
                        </div>
                      )}
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeFromCart(item.id)}
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className={`${styles.bonusSection} ${isBonusSectionOpen ? styles.bonusSectionOpen : ''}`}>
                <div className={styles.bonusHeader} onClick={() => setIsBonusSectionOpen(!isBonusSectionOpen)}>
                  <h2 className={styles.bonusTitle}>
                    Ваша скидочная карта
                    <button 
                      className={styles.infoIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowInfoModal(true);
                      }}
                      aria-label="Информация о скидках"
                    >
                      i
                    </button>
                  </h2>
                  <div className={`${styles.arrowIcon} ${isBonusSectionOpen ? styles.arrowIconOpen : ''}`}>
                    ▼
                  </div>
                </div>
                <div className={styles.bonusContent}>
                  <div className={styles.stampsContainer}>
                    <div className={styles.circleIndicator}>
                      {totalItemsCount} из 10 штампов
                    </div>
                    <div className={styles.stampsGrid}>
                      {[...Array(10)].map((_, index) => {
                        const isActive = index < totalItemsCount;
                        const isSecondCircle = index >= 5 && index < totalItemsCount;
                        return (
                          <div
                            key={index}
                            className={`${styles.stamp} ${
                              isActive ? (isSecondCircle ? styles.stampActiveSecondCircle : styles.stampActive) : ''
                            }`}
                          >
                            <span className={styles.stampNumber}>{index + 1}</span>
                            {isActive && (
                              <span className={styles.stampDiscount}>
                                {index === 4 ? '2р.' : index === 9 ? '10р.' : ''}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {discount > 0 && (
                      <div className={styles.discountApplied}>
                        Ваша скидка: {discount} BYN
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <h2 className={styles.emptyTitle}>Ваша корзина пуста</h2>
              <p className={styles.emptyText}>Добавьте товары для оформления заказа</p>
              <Link href="/" className={styles.continueShopping}>
                Продолжить покупки
              </Link>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className={styles.summarySection}>
            <div className={styles.summaryContent}>
              <div className={styles.summaryRow}>
                <span>Товаров в корзине:</span>
                <span>{totalItemsCount} шт.</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Сумма:</span>
                <span>{totalAmount} BYN</span>
              </div>
              {discount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Скидка:</span>
                  <span>-{discount} BYN</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Итого:</span>
                <span>{finalAmount} BYN</span>
              </div>

              <button
                onClick={() => {
                  console.log('Оформить заказ');
                }}
                className={styles.checkoutButton}
                disabled={isLoading}
              >
                {isLoading ? 'Оформление...' : 'Оформить заказ'}
              </button>
            </div>
          </div>
        )}
      </div>
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}
      
      {showInfoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button 
              className={styles.modalClose}
              onClick={() => setShowInfoModal(false)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <h3 className={styles.modalTitle}>Информация о скидках</h3>
            <p className={styles.modalText}>
              Соберите 5 штампов и получите скидку 2 BYN<br />
              Соберите 10 штампов и получите скидку 10 BYN
            </p>
          </div>
        </div>
      )}
    </>
  );
}