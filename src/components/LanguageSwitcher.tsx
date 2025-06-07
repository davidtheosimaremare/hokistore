"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLang } from '../context/LangContext';

const LanguageSwitcher: React.FC = () => {
  const { currentLang, setLang, getAvailableLanguages, isChanging } = useLang();
  const [mounted, setMounted] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const languages = getAvailableLanguages();

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-select')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get flag display with fallback
  const getFlagDisplay = (langCode: string) => {
    const flagMap: Record<string, string> = {
      'id': 'ID',
      'en': 'EN'
    };
    return flagMap[langCode] || langCode.toUpperCase();
  };

  if (!mounted) {
    return (
      <div className="flex items-center bg-transparent border border-gray-300 rounded-md px-1.5 py-0.5">
        <span className="text-xs font-bold text-gray-700 mr-1">
          {getFlagDisplay('id')}
        </span>
        <ChevronDown className="w-3 h-3 text-gray-500" />
      </div>
    );
  }

  const handleLanguageChange = (langCode: string) => {
    if (langCode !== currentLang && !isChanging) {
      setLang(langCode);
      setIsOpen(false);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang);

  return (
    <div className="language-select relative">
      {/* Updated Select Trigger for White Background */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className={`flex items-center bg-transparent hover:bg-gray-100 border border-gray-300 rounded-md px-1.5 py-0.5 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 ${
          isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
        } ${isOpen ? 'border-gray-400 bg-gray-100' : ''}`}
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        {/* Loading State */}
        {isChanging ? (
          <div className="w-3 h-3 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            {/* Current Language Display */}
            <span className="text-xs font-bold text-gray-700 mr-1">
              {getFlagDisplay(currentLang)}
            </span>
            
            {/* Dropdown Arrow - smaller */}
            <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </>
        )}
      </button>

      {/* Enhanced Dropdown Menu */}
      {isOpen && !isChanging && (
        <div className="absolute top-full right-0 mt-1 w-14 bg-white border border-gray-200 rounded-md shadow-xl z-50 overflow-hidden backdrop-blur-sm">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-center px-1.5 py-1.5 text-left transition-colors duration-150 hover:bg-red-50 focus:outline-none focus:bg-red-50 ${
                currentLang === lang.code 
                  ? 'bg-red-50 text-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
              title={`Switch to ${lang.name}`}
            >
              {/* Language Code with visual emphasis */}
              <span className={`text-xs font-bold uppercase tracking-wide ${
                currentLang === lang.code ? 'text-red-600' : 'text-gray-700'
              }`}>
                {lang.shortName}
              </span>
              
              {/* Active indicator */}
              {currentLang === lang.code && (
                <div className="w-1 h-1 bg-red-600 rounded-full ml-1"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Minimal Custom Styles */}
      <style jsx>{`
        .language-select {
          position: relative;
          font-size: 12px;
        }
        
        /* Smooth and minimal animations */
        .language-select [role="listbox"] {
          animation: slideDown 0.15s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Keep it compact on mobile */
        @media (max-width: 640px) {
          .language-select {
            font-size: 11px;
          }
        }
        
        /* Minimal focus states */
        .language-select button:focus-visible {
          outline: 1px solid #ef4444;
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher; 