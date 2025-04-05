'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Product, CartItem } from '@/types/product';
import styles from './ProductCard.module.css';
import ImagePlaceholder from './ImagePlaceholder';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export default function ProductCard({ product, categoryName }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stockInfo, setStockInfo] = useState<{ stock: number; available: boolean } | null>(null);

  useEffect(() => {
    setStockInfo({
      stock: product.stock,
      available: product.available
    });
  }, [product.stock, product.available]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    setImageError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageError(false);
  }, []);

  const getImageUrl = useCallback(() => {
    if (!product.imageUrl) return null;
    
    // Если URL содержит storage.files.mow1.cloud.servers.ru, используем прокси
    if (product.imageUrl.includes('storage.files.mow1.cloud.servers.ru')) {
      return `/api/images/${encodeURIComponent(product.imageUrl)}`;
    }
    
    // Если URL содержит api.moysklad.ru, используем прокси МойСклад
    if (product.imageUrl.includes('api.moysklad.ru')) {
      return `/api/moysklad/image?url=${encodeURIComponent(product.imageUrl)}`;
    }
    
    // Для остальных случаев возвращаем оригинальный URL
    return product.imageUrl;
  }, [product.imageUrl]);

  const handleAddToCart = () => {
    if (!stockInfo?.available) {
      return;
    }

    addToCart(product, 1);
  };

  const existingItem = items.find(item => item.id === product.id);
  const isAvailableForCart = stockInfo?.available && (!existingItem || existingItem.quantity < stockInfo.stock);

  const renderImage = () => {
    const imageUrl = getImageUrl();
    
    if (!imageUrl || imageError) {
      return <ImagePlaceholder />;
    }

    return (
      <Image
        src={imageUrl}
        alt={product.name}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`${styles.productImage} product-card`}
        width={300}
        height={300}
        priority
        unoptimized={true}
        quality={100}
      />
    );
  };

  const renderModalImage = () => {
    const imageUrl = getImageUrl();
    
    if (!imageUrl || imageError) {
      return <ImagePlaceholder />;
    }

    return (
      <Image
        src={imageUrl}
        alt={product.name}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={styles.modalImage}
        width={500}
        height={500}
        priority
        unoptimized={true}
        quality={100}
      />
    );
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageWrapper} onClick={() => setIsModalOpen(true)}>
          {renderImage()}
        </div>
        <div className={styles.info}>
          <div className={styles.titleWrapper}>
            <h3 className={styles.name}>{product.name}</h3>
          </div>
          {categoryName && (
            <Link href={`/category/${product.categoryId}`} className={styles.category}>
              {categoryName}
            </Link>
          )}
          <div className={styles.priceWrapper}>
            {isAvailableForCart ? (
              <>
                <span className={styles.price}>{product.price} BYN</span>
                {product.oldPrice && (
                  <span className={styles.oldPrice}>{product.oldPrice} BYN</span>
                )}
              </>
            ) : (
              <span className={styles.outOfStock}>Нет в наличии</span>
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
            
            <div className={styles.modalContent}>
              <div className={styles.modalImageWrapper}>
                {renderModalImage()}
              </div>

              <h2 className={styles.modalTitle}>{product.name}</h2>
              {categoryName && (
                <div className={styles.modalCategory}>
                  {categoryName}
                </div>
              )}
              
              <div className={styles.modalInfo}>
                <div className={styles.modalPrice}>
                  {product.price} BYN
                  {product.oldPrice && (
                    <span className={styles.oldPrice}>{product.oldPrice} BYN</span>
                  )}
                </div>
                
                <div className={styles.stockInfo}>
                  {stockInfo ? (
                    stockInfo.available ? (
                      <>
                        <span className={styles.stockAvailable}>В наличии</span>
                        <span className={styles.stockCount}>({stockInfo.stock} шт.)</span>
                      </>
                    ) : (
                      <span className={styles.stockUnavailable}>Нет в наличии</span>
                    )
                  ) : (
                    <span className={styles.stockLoading}>Проверка наличия...</span>
                  )}
                </div>
              </div>

              <button
                className={`${styles.addToCartButton} ${!isAvailableForCart ? styles.disabled : ''}`}
                onClick={handleAddToCart}
                disabled={!isAvailableForCart}
              >
                {isAvailableForCart ? 'Добавить в корзину' : 'Сделать заказ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 