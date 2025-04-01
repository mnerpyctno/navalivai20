'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { stockStore } from '@/lib/stockStore';
import styles from '@/styles/ProductCard.module.css';
import { Product } from '@/types/product';
import ErrorPopup from '@/components/ErrorPopup';
import ImagePlaceholder from '@/components/ImagePlaceholder';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stock, setStock] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const stockData = await stockStore.getStock(product.id);
        setStock(stockData);
      } catch (error) {
        console.error('Ошибка при получении остатка:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStock();
  }, [product.id]);

  const existingItem = items.find(item => item.id === product.id);
  const isInStock = !isLoading && stock && stock > 0;
  const isAvailableForCart = isInStock && (!existingItem || existingItem.quantity < stock);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!stock) {
        setError('Нет данных о наличии');
        return;
      }

      if (stock <= 0) {
        setError('Товар отсутствует на складе');
        return;
      }

      if (existingItem) {
        setError('Товар уже добавлен в корзину');
        return;
      }

      await addToCart({
        ...product,
        id: product.id,
        quantity: 1
      });
      setError(null);
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      setError('Ошибка при добавлении в корзину');
    }
  };

  const handleImageError = () => {
    console.error('Ошибка загрузки изображения:', {
      imageUrl: product.image,
      productName: product.name,
      productId: product.id
    });
    setImageError(true);
  };

  useEffect(() => {
    console.log('ProductCard: Загрузка изображения:', {
      imageUrl: product.image,
      productName: product.name,
      productId: product.id
    });
  }, [product.image, product.name, product.id]);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageWrapper} onClick={() => setIsModalOpen(true)}>
          {!imageError ? (
            <Image
              src={product.image || '/default-product.jpg'}
              alt={product.name}
              fill
              className={styles.image}
              sizes="(max-width: 480px) 50vw, 33vw"
              onError={handleImageError}
              priority
            />
          ) : (
            <ImagePlaceholder className={styles.image} />
          )}
        </div>
        <div className={styles.info}>
          <div className={styles.titleWrapper}>
            <div className={styles.name}>
              {product.name}
            </div>
          </div>
          <div className={styles.priceWrapper}>
            {isAvailableForCart ? (
              <>
                <div className={styles.price}>{product.price} BYN</div>
                {product.oldPrice && (
                  <div className={styles.oldPrice}>{product.oldPrice} BYN</div>
                )}
              </>
            ) : (
              <div className={styles.outOfStock}>Нет в наличии</div>
            )}
          </div>
          <button
            className={`${styles.addButton} ${!isAvailableForCart ? styles.disabled : ''}`}
            onClick={handleAddToCart}
            disabled={!isAvailableForCart}
          >
            {isAvailableForCart ? 'В корзину' : 'Сделать заказ'}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
              ×
            </button>
            <div className={styles.modalImageWrapper}>
              {!imageError ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className={styles.modalImage}
                  sizes="(max-width: 480px) 100vw, 400px"
                />
              ) : (
                <ImagePlaceholder className={styles.modalImage} />
              )}
            </div>
            <div className={styles.modalContent}>
              <div className={styles.modalTitle}>{product.name}</div>
              <div className={styles.modalInfo}>
                <div className={styles.modalPrice}>
                  <span className={styles.modalLabel}>Цена:</span>
                  <span className={styles.modalValue}>{product.price} BYN</span>
                </div>
                {product.oldPrice && (
                  <div className={styles.modalPrice}>
                    <span className={styles.modalLabel}>Старая цена:</span>
                    <span className={styles.modalValue}>{product.oldPrice} BYN</span>
                  </div>
                )}
                <div className={styles.modalStock}>
                  <span className={styles.modalLabel}>Наличие:</span>
                  {isLoading ? (
                    <span className={styles.stockLoading}>Загрузка...</span>
                  ) : stock && stock > 0 ? (
                    <span className={styles.stockAvailable}>В наличии ({stock} шт.)</span>
                  ) : (
                    <span className={styles.stockUnavailable}>Нет в наличии</span>
                  )}
                </div>
              </div>
              <button
                className={`${styles.addToCartButton} ${!isAvailableForCart ? styles.disabled : ''}`}
                onClick={handleAddToCart}
                disabled={!isAvailableForCart}
              >
                {isAvailableForCart ? 'В корзину' : 'Сделать заказ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <ErrorPopup
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </>
  );
} 