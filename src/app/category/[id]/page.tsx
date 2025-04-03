'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from '@/styles/Category.module.css';
import { productsApi } from '@/api/products';
import { Product } from '@/types/product';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { ITEMS_PER_PAGE } from '@/config/constants';
import ImagePlaceholder from '@/components/ImagePlaceholder';

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const { addToCart } = useCart();

  const loadProducts = useCallback(async (pageNumber: number) => {
    try {
      const response = await productsApi.getProducts({
        limit: ITEMS_PER_PAGE,
        offset: (pageNumber - 1) * ITEMS_PER_PAGE,
        categoryId: params.id
      });
      
      const products = response.rows.map(product => ({
        id: product.id,
        name: product.name,
        price: product.salePrices?.[0]?.value ? product.salePrices[0].value / 100 : 0,
        image: product.images?.rows?.[0]?.miniature?.href || '/default-product.jpg',
        description: product.description || '',
        categoryId: product.productFolder?.meta?.href?.split('/').pop() || '',
        available: true,
        stock: 0
      }));
      
      setProducts(prev => pageNumber === 1 ? products : [...prev, ...products]);
      setHasMore((response.meta?.size || 0) > pageNumber * ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
    }
  }, [params.id]);

  useEffect(() => {
    setInitialLoad(true);
    setPage(1);
    loadProducts(1);
  }, [params.id, loadProducts]);

  useEffect(() => {
    if (!hasMore || loading || initialLoad) return;

    const currentObserver = observer.current;
    if (currentObserver) {
      currentObserver.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1);
      }
    });

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [hasMore, loading, initialLoad]);

  useEffect(() => {
    if (page > 1 && !initialLoad) {
      loadProducts(page);
    }
  }, [page, loadProducts, initialLoad]);

  useEffect(() => {
    const fetchImages = async () => {
      const imagePromises = products.map(async (product) => {
        try {
          const images = await productsApi.getProductImages(product.id);
          if (images.length > 0) {
            setProductImages(prev => ({
              ...prev,
              [product.id]: images[0].miniature
            }));
          }
        } catch (error) {
          console.error('Error fetching images for product:', product.id, error);
        }
      });

      await Promise.all(imagePromises);
    };

    if (products.length > 0) {
      fetchImages();
    }
  }, [products]);

  const handleImageError = (productId: string) => {
    console.error('Image loading error for product:', productId);
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const handleImageLoad = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: false }));
  };

  if (initialLoad) {
    return (
      <main className={styles.main}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Загрузка товаров...</p>
        </div>
      </main>
    );
  }

  if (error && products.length === 0) {
    return (
      <main className={styles.main}>
        <Header />
        <div className={styles.emptyState}>
          <h2>Произошла ошибка</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!products || products.length === 0) {
    return (
      <main className={styles.main}>
        <Header />
        <div className={styles.emptyState}>
          <h2>Товары не найдены</h2>
          <p>В данной категории пока нет товаров</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.container}>
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImageContainer}>
                {!imageErrors[product.id] && productImages[product.id] ? (
                  <Image
                    src={productImages[product.id]}
                    alt={product.name}
                    fill
                    loading="lazy"
                    className={styles.productImage}
                    onError={() => handleImageError(product.id)}
                    onLoad={() => handleImageLoad(product.id)}
                  />
                ) : (
                  <ImagePlaceholder className={styles.productImage} />
                )}
              </div>
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.price}>{product.price} BYN</p>
                <button
                  className={styles.addToCartButton}
                  onClick={() => addToCart({
                    ...product,
                    id: product.id,
                    quantity: 1,
                    image: productImages[product.id] || null
                  })}
                >
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
        {(loading || hasMore) && !error && (
          <div ref={loadingRef} className={styles.loading}>
            <div className={styles.spinner} />
            <p>Загрузка товаров...</p>
          </div>
        )}
      </div>
    </main>
  );
} 