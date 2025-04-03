'use client';

import { useCart } from '@/context/CartContext';
import styles from '@/styles/Cart.module.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import ErrorPopup from '@/components/ErrorPopup';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import { stockStore } from '@/lib/stockStore';
import { productsApi } from '@/api/products';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  stock: number;
}

export default function Cart() {
  const { items, updateQuantity, removeFromCart } = useCart();
  const totalItemsCount = items.reduce((total, item) => total + item.quantity, 0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [productImages, setProductImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchImages = async () => {
      const imagePromises = items.map(async (item) => {
        try {
          const images = await productsApi.getProductImages(item.id);
          if (images.length > 0) {
            setProductImages(prev => ({
              ...prev,
              [item.id]: images[0].miniature
            }));
          }
        } catch (error) {
          console.error('Error fetching images for item:', item.id, error);
        }
      });

      await Promise.all(imagePromises);
    };

    fetchImages();
  }, [items]);

  const totalAmount = items.reduce((total, item) => {
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

  // Генерация массива штампов с учетом повторного использования
  const stampArray = Array.from({ length: 10 }, (_, index) => {
    const stampNumber = index + 1;
    const isActive = stampNumber <= totalItemsCount;
    const repeatCount = Math.floor((totalItemsCount - 1) / 10);
    const isSecondCircle = stampNumber <= (totalItemsCount % 10 || 10) && totalItemsCount > 10;
    
    return {
      number: stampNumber,
      isActive,
      isSecondCircle,
      repeatCount: isSecondCircle ? repeatCount : 0,
      discount: stampNumber === 5 ? '-2' : stampNumber === 10 ? '-10' : null
    };
  });

  const [error, setError] = useState<string | null>(null);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      const item = items.find(item => item.id === itemId);
      if (!item) return;

      if (newQuantity < 1) {
        removeFromCart(itemId);
        return;
      }

      const stockData = await stockStore.getStock(itemId);
      if (stockData === null || stockData === undefined) {
        setError('Нет данных о наличии');
        return;
      }

      if (newQuantity > stockData) {
        setError('Недостаточно товара на складе');
        return;
      }

      updateQuantity(itemId, newQuantity);
      setError(null);
    } catch (error) {
      console.error('Ошибка при обновлении количества:', error);
      setError('Ошибка при обновлении количества');
    }
  };

  const handleAddStamp = async (itemId: string) => {
    const item = items.find(item => item.id === itemId);
    if (!item) return;

    await handleQuantityChange(itemId, item.quantity + 1);
  };

  const handleRemoveStamp = async (itemId: string) => {
    const item = items.find(item => item.id === itemId);
    if (!item) return;

    await handleQuantityChange(itemId, item.quantity - 1);
  };

  const handleImageError = (id: string) => {
    console.error('Image loading error for item:', id);
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleImageLoad = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: false }));
  };

  return (
    <>
      <Header />
      <div className={styles.main}>
        <div className={styles.cartSection}>
          {items.length > 0 ? (
            <div className={styles.cartItems}>
              {items.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.imageContainer}>
                    {!imageErrors[item.id] && productImages[item.id] ? (
                      <Image
                        src={productImages[item.id]}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className={styles.image}
                        onError={() => handleImageError(item.id)}
                        onLoad={() => handleImageLoad(item.id)}
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <div className={styles.itemPrice}>{item.price} ₽</div>
                    </div>
                    <div className={styles.quantityControls}>
                      <button
                        className={styles.quantityButton}
                        onClick={() => handleRemoveStamp(item.id)}
                      >
                        -
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button
                        className={styles.quantityButton}
                        onClick={() => handleAddStamp(item.id)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeFromCart(item.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <h2 className={styles.emptyTitle}>Корзина пуста</h2>
              <p className={styles.emptyText}>Добавьте товары для оформления заказа</p>
            </div>
          )}
        </div>

        <div className={styles.bonusSection}>
          <div className={styles.bonusContent}>
            <h2 className={styles.bonusTitle}>Скидочная карта</h2>
            <div className={styles.stampsGrid}>
              {stampArray.map((stamp) => (
                <div
                  key={stamp.number}
                  className={`${styles.stamp} ${stamp.isActive ? (stamp.repeatCount > 0 ? styles.stampActiveSecondCircle : styles.stampActive) : ''}`}
                >
                  <span className={styles.stampNumber}>{stamp.number}</span>
                  {stamp.discount && (
                    <span className={styles.stampDiscount}>{stamp.discount}руб</span>
                  )}
                  {stamp.repeatCount > 0 && (
                    <div className={styles.repeatIndicator}>
                      {stamp.repeatCount}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {discount > 0 && (
              <p className={styles.discountApplied}>
                Скидка {discount} BYN применена!
              </p>
            )}
            <p className={styles.stampsInfo}>
              Штампов в этом заказе: {totalItemsCount}
            </p>
          </div>
        </div>

        <div className={styles.totalSection}>
          <div className={styles.totalRow}>
            <span>Товары ({totalItemsCount})</span>
            <span>{totalAmount} BYN</span>
          </div>
          {discount > 0 && (
            <div className={styles.totalRow}>
              <span>Скидка:</span>
              <span className={styles.discountAmount}>-{discount} BYN</span>
            </div>
          )}
          <div className={styles.totalRow}>
            <span>Итого:</span>
            <span className={styles.finalAmount}>{finalAmount} BYN</span>
          </div>
          <button 
            className={styles.checkoutButton}
            disabled={items.length === 0}
          >
            Оформить заказ
          </button>
        </div>
      </div>

      {error && (
        <ErrorPopup
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </>
  );
} 