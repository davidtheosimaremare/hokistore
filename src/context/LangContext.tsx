"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import idLang from '../lang/id.js';
import enLang from '../lang/en.js';

// Types for language data structure
interface LanguageData {
  nav: {
    home: string;
    products: string;
    services: string;
    projects: string;
    about: string;
    contact: string;
    categories: string;
    login: string;
  };
  categories: Array<{
    name: string;
    description: string;
    href: string;
  }>;
  hero: {
    companyBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    exploreButton: string;
    consultationButton: string;
    slides: Array<{
      title: string;
      description: string;
    }>;
  };
  trusted: {
    title: string;
    subtitle: string;
    companies: string;
    rating: string;
    warranty: string;
    companyLogos: Array<{
      name: string;
      image: string;
      alt: string;
    }>;
  };
  featuredProducts: {
    title: string;
    subtitle: string;
  };
  whyChoose: {
    title: string;
    subtitle: string;
    ctaButton: string;
    reasons: Array<{
      title: string;
      description: string;
      image: string;
    }>;
  };
  projects: {
    title: string;
    subtitle: string;
    viewDetails: string;
    viewAll: string;
    projectList: Array<{
      id: number;
      title: string;
      description: string;
      location: string;
      year: string;
      client: string;
      image: string;
      category: string;
    }>;
  };
  consultation: {
    floatingButton: string;
    modalTitle: string;
    modalSubtitle: string;
    phoneLabel: string;
    phonePlaceholder: string;
    submitButton: string;
    disclaimer: string;
  };
  common: {
    search: string;
    searchMobile: string;
    close: string;
    loading: string;
    error: string;
    back: string;
    contactUs: string;
    companyTagline: string;
  };
  products: {
    title: string;
    subtitle: string;
    addToCart: string;
    viewDetails: string;
    viewAll: string;
    viewAllCategories: string;
    loading: string;
    error: string;
    retry: string;
    inStock: string;
    outOfStock: string;
    contactForPrice: string;
    category: string;
    sort: string;
    filter: string;
    resetFilter: string;
    showingProducts: string;
    allCategories: string;
    sortByNameAsc: string;
    sortByNameDesc: string;
    sortByPriceAsc: string;
    sortByPriceDesc: string;
    viewMode: string;
    noProductsFound: string;
    changeFilter: string;
    loadingMore: string;
    allProductsLoaded: string;
  };
  cart: {
    title: string;
    emptyCart: string;
    emptyCartMessage: string;
    viewProducts: string;
    backToCart: string;
    itemCount: string;
    clearCart: string;
    removeItem: string;
    viewDetail: string;
    askProduct: string;
    orderSummary: string;
    subtotal: string;
    shipping: string;
    freeShipping: string;
    total: string;
    checkout: string;
    continueShopping: string;
    freeShippingNote: string;
    freeConsultation: string;
  };
  checkout: {
    title: string;
    shippingInfo: string;
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    orderNotes: string;
    fullNamePlaceholder: string;
    phonePlaceholder: string;
    emailPlaceholder: string;
    addressPlaceholder: string;
    cityPlaceholder: string;
    postalCodePlaceholder: string;
    orderNotesPlaceholder: string;
    orderViaMhatsApp: string;
    processing: string;
    orderWillBeSent: string;
    required: string;
  };
  productDetail: {
    backToProducts: string;
    productNotFound: string;
    productNotFoundMessage: string;
    loadingProduct: string;
    productNumber: string;
    shortName: string;
    brand: string;
    model: string;
    category: string;
    warehouse: string;
    stock: string;
    price: string;
    quantity: string;
    addToCart: string;
    askViaWhatsApp: string;
    shareProduct: string;
    specifications: string;
    description: string;
    relatedProducts: string;
    inStock: string;
    outOfStock: string;
    maxQuantity: string;
    minQuantity: string;
  };
  auth: {
    loginTitle: string;
    registerTitle: string;
    email: string;
    password: string;
    confirmPassword: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    loginButton: string;
    registerButton: string;
    signInWithGoogle: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    registerLink: string;
    loginLink: string;
    forgotPassword: string;
    rememberMe: string;
    loading: string;
    loginSuccess: string;
    registerSuccess: string;
    loginError: string;
    registerError: string;
    emailRequired: string;
    passwordRequired: string;
    passwordTooShort: string;
    passwordMismatch: string;
    invalidEmail: string;
    logout: string;
    dashboard: string;
    profile: string;
    myOrders: string;
    settings: string;
  };
}

interface LanguageInfo {
  code: string;
  name: string;
  shortName: string;
}

interface LangContextType {
  currentLang: string;
  lang: LanguageData;
  setLang: (newLang: string) => void;
  isChanging: boolean;
  getAvailableLanguages: () => LanguageInfo[];
  getCurrentLanguageInfo: () => LanguageInfo | undefined;
}

interface LangProviderProps {
  children: ReactNode;
}

// Language object mapping
const languages: Record<string, LanguageData> = {
  id: idLang,
  en: enLang
};

// Create the context
const LangContext = createContext<LangContextType | undefined>(undefined);

// Custom hook to use the language context
export const useLang = (): LangContextType => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within a LangProvider');
  }
  return context;
};

// Language Provider Component
export const LangProvider: React.FC<LangProviderProps> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<string>('id'); // Default to Indonesian
  const [langData, setLangData] = useState<LanguageData>(languages.id);
  const [isChanging, setIsChanging] = useState<boolean>(false);

  // Load saved language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('selected-language');
      if (savedLang && languages[savedLang]) {
        setCurrentLang(savedLang);
        setLangData(languages[savedLang]);
      }
    }
  }, []);

  // Function to change language
  const setLang = (newLang: string): void => {
    if (!languages[newLang] || newLang === currentLang) return;
    
    setIsChanging(true);
    
    // Add a small delay for smooth transition
    setTimeout(() => {
      setCurrentLang(newLang);
      setLangData(languages[newLang]);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selected-language', newLang);
      }
      setIsChanging(false);
    }, 150);
  };

  // Get available languages
  const getAvailableLanguages = (): LanguageInfo[] => {
    return [
      { code: 'id', name: 'Bahasa Indonesia', shortName: 'ID' },
      { code: 'en', name: 'English', shortName: 'EN' }
    ];
  };

  // Get current language info
  const getCurrentLanguageInfo = (): LanguageInfo | undefined => {
    const langs = getAvailableLanguages();
    return langs.find(lang => lang.code === currentLang);
  };

  const value: LangContextType = {
    // Current language code (id, en)
    currentLang,
    
    // Current language data object
    lang: langData,
    
    // Function to change language
    setLang,
    
    // Whether language is currently changing (for animations)
    isChanging,
    
    // Helper functions
    getAvailableLanguages,
    getCurrentLanguageInfo
  };

  return (
    <LangContext.Provider value={value}>
      <div className={`transition-opacity duration-300 ${isChanging ? 'opacity-90' : 'opacity-100'}`}>
        {children}
      </div>
    </LangContext.Provider>
  );
}; 