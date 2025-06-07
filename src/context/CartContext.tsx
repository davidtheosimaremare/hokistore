"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AccurateProduct } from '@/services/accurateApi';

export interface CartItem extends AccurateProduct {
  quantity: number;
  addedAt: Date;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
}

export interface CartContextType {
  state: CartState;
  addToCart: (product: AccurateProduct, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: AccurateProduct; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'LOAD_CART'; payload: { items: CartItem[] } };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);

      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          ...product,
          quantity,
          addedAt: new Date()
        };
        newItems = [...state.items, newItem];
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice
      };
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.id !== action.payload.productId);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: { productId } });
      }

      const newItems = state.items.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      };

    case 'LOAD_CART': {
      const items = action.payload.items;
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      return {
        ...state,
        items,
        totalItems,
        totalPrice
      };
    }

    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('hokistore-cart');
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: { items: cartData } });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hokistore-cart', JSON.stringify(state.items));
    }
  }, [state.items]);

  const addToCart = (product: AccurateProduct, quantity: number = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
  };

  const removeFromCart = (productId: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const getTotalPrice = () => state.totalPrice;
  const getTotalItems = () => state.totalItems;

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    getTotalPrice,
    getTotalItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 