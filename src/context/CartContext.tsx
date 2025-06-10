"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  unit?: string;
  brand?: string;
  category?: string;
  stock_quantity?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  totalAmount: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  getCartItemQuantity: (id: string) => number;
  validateStock: () => Promise<{ valid: boolean; invalidItems: string[] }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('hokistore-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    localStorage.setItem('hokistore-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate cart count (number of unique items)
  const cartCount = cartItems.length;

  // Calculate total amount
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Add item to cart with stock validation
  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1): { success: boolean; message?: string } => {
    // Check if item has stock_quantity defined and if it's sufficient
    if (item.stock_quantity !== undefined && item.stock_quantity <= 0) {
      return { success: false, message: 'Produk ini sedang tidak tersedia (stok habis)' };
    }

    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    const totalQuantityNeeded = currentQuantityInCart + quantity;

    // Check if total quantity exceeds available stock
    if (item.stock_quantity !== undefined && totalQuantityNeeded > item.stock_quantity) {
      return { 
        success: false, 
        message: `Tidak dapat menambahkan ${quantity} item. Stok tersedia: ${item.stock_quantity}, sudah di keranjang: ${currentQuantityInCart}` 
      };
    }

    setCartItems(prevItems => {
      if (existingItem) {
        // Item already exists, update quantity
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // New item, add to cart
        return [...prevItems, { ...item, quantity }];
      }
    });

    return { success: true };
  };

  // Remove item from cart completely
  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Update item quantity with stock validation
  const updateQuantity = (id: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(id);
      return { success: true };
    }

    const item = cartItems.find(cartItem => cartItem.id === id);
    if (!item) {
      return { success: false, message: 'Item tidak ditemukan di keranjang' };
    }

    // Check if quantity exceeds available stock
    if (item.stock_quantity !== undefined && quantity > item.stock_quantity) {
      return { 
        success: false, 
        message: `Jumlah melebihi stok tersedia. Stok tersedia: ${item.stock_quantity}` 
      };
    }

    setCartItems(prevItems =>
      prevItems.map(cartItem =>
        cartItem.id === id ? { ...cartItem, quantity } : cartItem
      )
    );

    return { success: true };
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Check if item is in cart
  const isInCart = (id: string): boolean => {
    return cartItems.some(item => item.id === id);
  };

  // Get quantity of specific item in cart
  const getCartItemQuantity = (id: string): number => {
    const item = cartItems.find(cartItem => cartItem.id === id);
    return item ? item.quantity : 0;
  };

  // Validate stock for all items in cart (can be used before checkout)
  const validateStock = async (): Promise<{ valid: boolean; invalidItems: string[] }> => {
    const invalidItems: string[] = [];

    for (const item of cartItems) {
      // If stock_quantity is defined and item quantity exceeds stock
      if (item.stock_quantity !== undefined && item.quantity > item.stock_quantity) {
        invalidItems.push(`${item.name} (tersedia: ${item.stock_quantity}, di keranjang: ${item.quantity})`);
      } else if (item.stock_quantity !== undefined && item.stock_quantity <= 0) {
        invalidItems.push(`${item.name} (stok habis)`);
      }
    }

    return {
      valid: invalidItems.length === 0,
      invalidItems
    };
  };

  const value: CartContextType = {
    cartItems,
    cartCount,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItemQuantity,
    validateStock
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 