'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from '@/styles/Category.module.css';
import { Product } from '@/types/product';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { ITEMS_PER_PAGE } from '@/config/constants';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import { env } from '@/config/env';

interface LocalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
  available: boolean;
  stock: number;
  article: string;
  weight: number;
  volume: number;
  isArchived: boolean;
  salePrices?: {
    priceType?: {
      name: string;
    };
    value: number;
  }[];
}

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [products, setProducts] = useState<LocalProduct[]>([]);
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
      const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/products?categoryId=${params.id}&limit=${ITEMS_PER_PAGE}&offset=${(pageNumber - 1) * ITEMS_PER_PAGE}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const newProducts = data.rows.map((product: LocalProduct) => {
        // Находим цену продажи в массиве salePrices
        const retailPrice = product.salePrices?.find((price: any) => 
          price.priceType?.name === 'Цена продажи' || 
          price.priceType?.name === 'Розничная цена' ||
          price.priceType?.name === 'Цена'
        ) || product.salePrices?.[0];
        
        // Получаем значение цены и делим на 100 (копейки в рубли)
        const price = retailPrice?.value ? retailPrice.value / 100 : 0;
        
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: price,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          categoryName: product.categoryName,
          available: true,
          stock: 0,
          article: product.article || '',
          weight: product.weight || 0,
          volume: product.volume || 0,
          isArchived: product.isArchived || false
        };
      });
      
      setProducts(prev => pageNumber === 1 ? newProducts : [...prev, ...newProducts]);
      setHasMore((data.meta?.size || 0) > pageNumber * ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
      setError('Ошибка при загрузке товаров');
    } finally {
      setLoading(false);
      setInitialLoad(false);
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
          const response = await fetch(`/api/products/${product.id}/images`);
          if (!response.ok) {
            throw new Error('Ошибка при загрузке изображений');
          }
          const images = await response.json();
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
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
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
                    id: product.id
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