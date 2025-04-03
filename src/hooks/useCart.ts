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

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product) => {
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
  };

  const removeFromCart = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(currentItems => {
      const item = currentItems.find(item => item.id === productId);
      if (!item || quantity > item.stock) return currentItems;
      return currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
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
    totalAmount
  };
} 