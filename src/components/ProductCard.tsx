import Image from 'next/image';
import styles from '@/styles/ProductCard.module.css';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      ...product,
      id: parseInt(product.id),
      quantity: 1
    });
  };

  return (
    <>
      <div className={styles.card} onClick={() => setIsModalOpen(true)}>
        <div className={styles.imageWrapper}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={styles.image}
            sizes="(max-width: 480px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.png';
            }}
          />
        </div>
        <div className={styles.info}>
          <div className={styles.titleWrapper}>
            <div className={styles.name}>
              {product.name}
            </div>
          </div>
          <div className={styles.priceWrapper}>
            <div className={styles.price}>{product.price} BYN</div>
            {product.oldPrice && (
              <div className={styles.oldPrice}>{product.oldPrice} BYN</div>
            )}
          </div>
          <button
            className={styles.addButton}
            onClick={handleAddToCart}
            disabled={!product.available}
          >
            {product.available ? 'В корзину' : 'Нет в наличии'}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
              ×
            </button>
            <h3 className={styles.modalTitle}>{product.name}</h3>
            <div className={styles.modalContent}>
              <div className={styles.modalInfo}>
                <div className={styles.modalPrice}>
                  <span className={styles.modalPriceLabel}>Цена:</span>
                  <span className={styles.modalPriceValue}>{product.price} BYN</span>
                </div>
                <div className={styles.modalStock}>
                  <span className={styles.modalStockLabel}>В наличии:</span>
                  <span className={`${styles.modalStockValue} ${product.available ? styles.inStock : styles.outOfStock}`}>
                    {product.available ? `Да (${product.stock} шт.)` : 'Нет'}
                  </span>
                </div>
              </div>
              <button 
                className={`${styles.addToCartButton} ${!product.available ? styles.disabled : ''}`}
                onClick={handleAddToCart}
                disabled={!product.available}
              >
                {product.available ? 'Добавить в корзину' : 'Товар отсутствует'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 