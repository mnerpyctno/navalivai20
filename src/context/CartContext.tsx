'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
<<<<<<< HEAD
import { Product } from '@/types/product';
import { CartItem } from '@/types/cart';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
  createOrder: (customerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
  }) => Promise<void>;
=======
import { Product, Order, Customer } from '@/lib/types';

interface CartContextType {
  items: (Product & { quantity: number })[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (customer: Customer) => Promise<Order>;
>>>>>>> 403f6ea (Last version)
}

const CartContext = createContext<CartContextType | undefined>(undefined);

<<<<<<< HEAD
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка корзины из localStorage при инициализации
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Сохранение корзины в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
=======
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<(Product & { quantity: number })[]>([]);

  const addToCart = (product: Product) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
>>>>>>> 403f6ea (Last version)
    });
  };

  const removeFromCart = (productId: string) => {
<<<<<<< HEAD
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
=======
    setItems(prev => prev.filter(item => item.id !== productId));
>>>>>>> 403f6ea (Last version)
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
<<<<<<< HEAD

    setItems(prevItems =>
      prevItems.map(item =>
=======
    setItems(prev =>
      prev.map(item =>
>>>>>>> 403f6ea (Last version)
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

<<<<<<< HEAD
  const createOrder = async (customerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders', {
=======
  const createOrder = async (customer: Customer): Promise<Order> => {
    try {
      // Создаем заказ через серверный эндпоинт
      const orderResponse = await fetch('/api/orders', {
>>>>>>> 403f6ea (Last version)
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
<<<<<<< HEAD
          ...customerInfo,
          items,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      clearCart();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    } finally {
      setIsLoading(false);
=======
          customer,
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Ошибка при создании заказа');
      }

      const orderData = await orderResponse.json();
      clearCart();
      return orderData;
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      throw error;
>>>>>>> 403f6ea (Last version)
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
<<<<<<< HEAD
        isLoading,
=======
>>>>>>> 403f6ea (Last version)
        createOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
<<<<<<< HEAD
};

export const useCart = () => {
=======
}

export function useCart() {
>>>>>>> 403f6ea (Last version)
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
<<<<<<< HEAD
}; 
=======
} 
>>>>>>> 403f6ea (Last version)
