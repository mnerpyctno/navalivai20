import { useState, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  available: boolean;
  stock: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState(false);
=======
>>>>>>> 403f6ea (Last version)

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

<<<<<<< HEAD
  const addToCart = async (product: Product) => {
=======
  const addToCart = (product: Product) => {
>>>>>>> 403f6ea (Last version)
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentItems, { ...product, quantity: 1 }];
    });
<<<<<<< HEAD

    // Проверяем наличие товара на сервере
    try {
      const response = await fetch('/api/cart/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: [{ id: product.id, quantity: 1 }] }),
      });

      if (!response.ok) {
        throw new Error('Failed to check product availability');
      }

      const data = await response.json();
      const isAvailable = data.find((item: any) => item.id === product.id)?.available;

      if (!isAvailable) {
        // Если товар недоступен, удаляем его из корзины
        setItems(currentItems => currentItems.filter(item => item.id !== product.id));
        throw new Error('Product is not available');
      }
    } catch (error) {
      console.error('Error checking product availability:', error);
    }
=======
>>>>>>> 403f6ea (Last version)
  };

  const removeFromCart = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
  };

<<<<<<< HEAD
  const updateQuantity = async (productId: string, quantity: number) => {
=======
  const updateQuantity = (productId: string, quantity: number) => {
>>>>>>> 403f6ea (Last version)
    if (quantity < 1) return;
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
<<<<<<< HEAD

    // Проверяем наличие товара на сервере
    try {
      const response = await fetch('/api/cart/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: [{ id: productId, quantity }] }),
      });

      if (!response.ok) {
        throw new Error('Failed to check product availability');
      }

      const data = await response.json();
      const isAvailable = data.find((item: any) => item.id === productId)?.available;

      if (!isAvailable) {
        // Если товар недоступен, удаляем его из корзины
        setItems(currentItems => currentItems.filter(item => item.id !== productId));
        throw new Error('Product is not available');
      }
    } catch (error) {
      console.error('Error checking product availability:', error);
    }
=======
>>>>>>> 403f6ea (Last version)
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalAmount = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
<<<<<<< HEAD
    totalAmount,
    isLoading
=======
    totalAmount
>>>>>>> 403f6ea (Last version)
  };
} 