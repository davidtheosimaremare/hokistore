"use client";

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CartIconProps {
  itemCount?: number;
  onClick?: () => void;
}

const CartIcon: React.FC<CartIconProps> = ({ itemCount = 0, onClick }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/cart');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
    >
      <ShoppingCart className="w-6 h-6 text-gray-700" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon; 