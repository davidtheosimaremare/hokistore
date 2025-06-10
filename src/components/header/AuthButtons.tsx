"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';

interface AuthButtonsProps {
  isLoggedIn?: boolean;
  userEmail?: string;
  onLogout?: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ 
  isLoggedIn = false, 
  userEmail,
  onLogout 
}) => {
  const router = useRouter();

  if (isLoggedIn) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {userEmail?.split('@')[0] || 'User'}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
        >
          Keluar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => router.push('/login')}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
      >
        Masuk
      </button>
      <button
        onClick={() => router.push('/register')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
      >
        Daftar
      </button>
    </div>
  );
};

export default AuthButtons; 