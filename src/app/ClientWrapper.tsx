"use client";

import React from 'react';
import { LangProvider } from '@/context/LangContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import LoadingBar from '@/components/LoadingBar';

interface ClientWrapperProps {
  children: React.ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  return (
    <LangProvider>
      <AuthProvider>
        <CartProvider>
          <LoadingBar />
          {children}
        </CartProvider>
      </AuthProvider>
    </LangProvider>
  );
};

export default ClientWrapper; 