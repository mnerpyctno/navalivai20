'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { productsApi, ProductImage } from '@/api/products';
import { Product, MoySkladStock } from '@/types/product';
import styles from '@/styles/ProductCard.module.css';
import ErrorPopup from '@/components/ErrorPopup';
import ImagePlaceholder from '@/components/ImagePlaceholder';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stock, setStock] = useState<MoySkladStock | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true);
        const imagesData = await productsApi.getProductImages(product.id);
        
        setStock({
          rows: [{
            quantity: 0,
            product: { id: product.id, name: product.name },
            store: { id: 'default', name: 'Default Store' }
          }]
        } as MoySkladStock);
        
        setProductImages(imagesData);
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Ошибка при загрузке данных о товаре');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [product.id]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageError(false);
  }, []);

  const handleAddToCart = () => {
    if (!stock?.rows?.[0]?.quantity) {
      setError('Товар отсутствует в наличии');
      return;
    }

    addToCart({
      ...product,
      quantity: 1,
      available: stock.rows[0].quantity > 0,
      stock: stock.rows[0].quantity,
      description: product.description || '',
      categoryId: product.categoryId || '',
      image: currentImage?.miniature || null
    });
  };

  const currentImage = productImages[currentImageIndex];

  const existingItem = items.find(item => item.id === product.id);
  const isInStock = !isLoading && stock && stock.rows?.[0]?.quantity && stock.rows[0].quantity > 0;
  const isAvailableForCart = isInStock && (!existingItem || existingItem.quantity < stock.rows[0].quantity);

  const renderImage = () => {
    if (isLoading) {
      return <div className={styles.loading}>Загрузка...</div>;
    }

    if (imageError || !currentImage) {
      return <ImagePlaceholder />;
    }

    return (
      <Image
        src={currentImage.miniature}
        alt={product.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={styles.image}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={false}
        loading="lazy"
      />
    );
  };

  const renderModalImage = () => {
    if (!currentImage || imageError) {
      return <ImagePlaceholder />;
    }

    return (
      <Image
        src={currentImage.miniature}
        alt={product.name}
        fill
        sizes="100vw"
        className={styles.modalImage}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={true}
        loading="eager"
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
          <div className={styles.priceWrapper}>
            {isAvailableForCart ? (
              <>
                <span className={styles.price}>{product.price} ₽</span>
                {product.oldPrice && (
                  <span className={styles.oldPrice}>{product.oldPrice} ₽</span>
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
            {isAvailableForCart ? 'В корзину' : 'Нет в наличии'}
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
              
              <div className={styles.modalInfo}>
                <div className={styles.modalPrice}>
                  {product.price} ₽
                  {product.oldPrice && (
                    <span className={styles.oldPrice}>{product.oldPrice} ₽</span>
                  )}
                </div>
                
                <div className={styles.stockInfo}>
                  {isLoading ? (
                    <span className={styles.stockLoading}>Проверка наличия...</span>
                  ) : stock?.rows?.[0]?.quantity ? (
                    <span className={styles.stockAvailable}>
                      В наличии: {stock.rows[0].quantity} шт.
                    </span>
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
                {isAvailableForCart ? 'Добавить в корзину' : 'Нет в наличии'}
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