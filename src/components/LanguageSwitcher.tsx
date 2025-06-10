"use client";

import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';

const LanguageSwitcher: React.FC = () => {
  const { currentLang, setLang, isChanging } = useLang();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white w-12 flex items-center justify-center shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        ID
      </div>
    );
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!isChanging) {
      setLang(e.target.value);
    }
  };

  return (
    <div className="relative flex-shrink-0">
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        disabled={isChanging}
        className={`
          px-2 py-1 pr-5 text-xs font-semibold w-12
          bg-white/90 backdrop-blur-sm border border-gray-200
          rounded-lg shadow-sm hover:shadow-md
          hover:border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-400/20
          transition-all duration-200 ease-out outline-none
          appearance-none cursor-pointer text-center
          transform hover:scale-[1.02] active:scale-[0.98]
          ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          fontFamily: 'Montserrat, sans-serif',
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ef4444' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.25rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '0.75rem 0.75rem'
        }}
      >
        <option value="id" className="text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          ID
        </option>
        <option value="en" className="text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          EN
        </option>
      </select>

      {/* Compact Loading overlay */}
      {isChanging && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg">
          <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 