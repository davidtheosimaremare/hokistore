"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true,
  onClick 
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/');
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-12 w-auto'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
    >
      <Image
        src="/images/asset-web/logo.png"
        alt="Hokiindo Logo"
        width={120}
        height={40}
        priority
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <div className="flex flex-col items-start">
          <span className={`${textSizeClasses[size]} font-bold text-blue-900`}>
            Hokiindo
          </span>
          <span className="text-xs text-blue-600 font-medium">
            Industrial Solutions
          </span>
        </div>
      )}
    </button>
  );
};

export default Logo; 