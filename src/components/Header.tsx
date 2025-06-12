"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Menu,
  ChevronDown,
  Globe,
  Phone,
  AlignJustify,
  Zap,
  Settings,
  Power,
  Car,
  Lightbulb,
  Cable,
  MoreHorizontal,
  ArrowRight,
  MessageCircle,
  Loader2,
  X,
  User,
  LogOut,
  Package,
  Building2,
  FileText,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/lib/supabase";
import { formatRupiah } from "@/utils/formatters";
import { useCart } from "@/context/CartContext";

// Interface for Supabase products
interface SupabaseProduct {
  id: number
  name: string
  description?: string
  price: number
  stock_quantity: number
  category: string
  accurate_code?: string
  brand?: string
  status: string
  is_published: boolean
  is_available_online: boolean
  admin_thumbnail?: string
}

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SupabaseProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [mobileSearchResults, setMobileSearchResults] = useState<SupabaseProduct[]>([]);
  const [isMobileSearching, setIsMobileSearching] = useState(false);
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);

  
  const { lang } = useLang();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  
  // Determine if we're on homepage navigation pages or store pages
  const isHomepageNavigation = pathname === '/' || 
                              pathname.startsWith('/about') || 
                              pathname.startsWith('/contact') || 
                              pathname.startsWith('/blog') || 
                              pathname.startsWith('/projects');
  
  const isStorePage = pathname.startsWith('/products') || 
                     pathname.startsWith('/cart') || 
                     pathname.startsWith('/checkout') || 
                     pathname.startsWith('/dashboard') || 
                     pathname.startsWith('/search') ||
                     pathname.startsWith('/product/') ||
                     pathname.startsWith('/login') ||
                     pathname.startsWith('/register');
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const mobileDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Product category icons mapping
  const categoryIcons: Record<string, React.ReactElement> = {
    "Drive Technology": <Zap className="w-4 h-4" />,
    "Automation Technology": <Settings className="w-4 h-4" />,
    "Low Voltage Control and Distribution": <Power className="w-4 h-4" />,
    "AutoGo Series": <Car className="w-4 h-4" />,
    "LiteGo Series": <Lightbulb className="w-4 h-4" />,
    "MateGo Series": <MoreHorizontal className="w-4 h-4" />,
    "Industrial Lighting": <Lightbulb className="w-4 h-4" />,
    "Busduct": <Cable className="w-4 h-4" />
  };

  // Get product categories with icons
  const productCategories = lang.categories.map((category: any) => ({
    ...category,
    icon: categoryIcons[category.name] || <Settings className="w-4 h-4" />
  }));

  // WhatsApp contact URL
  const whatsappUrl = "https://wa.me/628111086180?text=Halo%20saya%20tertarik%20dengan%20produk%20Hokiindo%20Raya";

  // Debounced search function using Supabase
  const performSearch = async (query: string, isMobile: boolean = false) => {
    if (!query.trim()) {
      if (isMobile) {
        setMobileSearchResults([]);
        setShowMobileDropdown(false);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
      return;
    }

    const setLoading = isMobile ? setIsMobileSearching : setIsSearching;
    const setResults = isMobile ? setMobileSearchResults : setSearchResults;
    const setDropdown = isMobile ? setShowMobileDropdown : setShowDropdown;

    try {
      setLoading(true);
      
      console.log('🔍 [SEARCH] Searching products in Supabase for:', query);
      
      // Search products in Supabase database - only name and category (case insensitive)
      // Remove limit to get ALL results
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, description, price, stock_quantity, category, accurate_code, brand, status, is_published, is_available_online, admin_thumbnail')
        .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
        .order('name', { ascending: true });

      console.log('🔍 [SEARCH] Raw search results:', products?.length || 0, products);

      if (error) {
        console.error('❌ [SEARCH] Search error:', error);
        setResults([]);
        setDropdown(false);
        return;
      }

      // Apply minimal filters to show all relevant products
      const filteredProducts = (products || []).filter(product => {
        const notSuspended = product.status !== 'suspended';
        const isOnline = product.is_available_online !== false;
        return notSuspended && isOnline;
      });

      console.log(`✅ [SEARCH] Found ${filteredProducts.length} products`);
      
      // Update results
      setResults(filteredProducts);
      setDropdown(true);
      
    } catch (error) {
      console.error('💥 [SEARCH] Unexpected error:', error);
      setResults([]);
      setDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle desktop search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle mobile search input change
  const handleMobileSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMobileSearchQuery(value);

    // Clear previous debounce
    if (mobileDebounceRef.current) {
      clearTimeout(mobileDebounceRef.current);
    }

    // Set new debounce
    mobileDebounceRef.current = setTimeout(() => {
      performSearch(value, true);
    }, 300);
  };

  // Handle result click
  const handleResultClick = (productId: number) => {
    router.push(`/product/${productId}`);
    setShowDropdown(false);
    setShowMobileDropdown(false);
    setSearchQuery("");
    setMobileSearchQuery("");
  };

  // Handle search submission (Enter key or search button)
  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/products'); // Redirect to products page when search is empty
    }
    setShowDropdown(false);
    setShowMobileDropdown(false);
    setSearchQuery("");
    setMobileSearchQuery("");
  };

  // Handle key press for search submission
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, isMobile: boolean = false) => {
    if (e.key === 'Enter') {
      const query = isMobile ? mobileSearchQuery : searchQuery;
      handleSearchSubmit(query);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setShowMobileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear search
  const clearSearch = (isMobile: boolean = false) => {
    if (isMobile) {
      setMobileSearchQuery("");
      setMobileSearchResults([]);
      setShowMobileDropdown(false);
    } else {
      setSearchQuery("");
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Render search dropdown
  const renderSearchDropdown = (results: SupabaseProduct[], isLoading: boolean, isVisible: boolean, isMobile: boolean = false) => {
    console.log('🎨 [DROPDOWN] Render conditions:', { 
      resultsLength: results.length, 
      isLoading, 
      isVisible, 
      isMobile
    });
    
    if (!isVisible && !isLoading) return null;
    
    const query = isMobile ? mobileSearchQuery : searchQuery;

    return (
      <div className={`absolute top-full ${isMobile ? 'left-0 right-0' : 'left-1/4 right-0 max-w-2xl'} mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden`}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              {isLoading ? 'Mencari produk...' : `Hasil pencarian "${query}"`}
            </h3>
            {results.length > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {results.length} produk
              </span>
            )}
          </div>
        </div>

        {isLoading && results.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-red-600 mr-2" />
            <span className="text-gray-600 text-sm">Mencari produk...</span>
          </div>
        ) : results.length > 0 ? (
          <>
            {/* All Results */}
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="divide-y divide-gray-100">
                {results.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => handleResultClick(product.id)}
                    className="w-full px-4 py-4 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 transition-all duration-200 group"
                    style={{
                      opacity: 0,
                      transform: 'translateY(8px)',
                      animation: `fadeInUp 0.4s ease-out ${Math.min(index * 80, 800)}ms forwards`
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Product Icon/Image */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-red-100 group-hover:to-red-200 transition-all duration-200">
                        {product.admin_thumbnail ? (
                          <img 
                            src={product.admin_thumbnail} 
                            alt={product.name}
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors" />
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-tight mb-2">
                          {product.name}
                        </h4>
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-red-600">
                              {product.price > 0 ? formatRupiah(product.price) : 'Hubungi Sales'}
                            </span>
                            {product.accurate_code && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {product.accurate_code}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {product.category && (
                              <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full font-medium">
                                {product.category}
                              </span>
                            )}
                            {product.brand && (
                              <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full font-medium">
                                {product.brand}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              product.stock_quantity > 0 
                                ? 'text-green-700 bg-green-100' 
                                : 'text-orange-700 bg-orange-100'
                            }`}>
                              {product.stock_quantity > 0 ? `Stok: ${product.stock_quantity}` : 'Indent'}
                            </span>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {`Menampilkan ${results.length} produk`}
                </div>
                <button
                  onClick={() => handleSearchSubmit(query)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Tidak ada produk ditemukan</p>
            <p className="text-xs text-gray-500">Coba kata kunci yang berbeda</p>
          </div>
        )}
        
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(12px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .scrollbar-thin::-webkit-scrollbar {
              width: 6px;
            }
            
            .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
              background-color: #D1D5DB;
              border-radius: 3px;
            }
            
            .scrollbar-track-gray-100::-webkit-scrollbar-track {
              background-color: #F3F4F6;
            }
            
            .line-clamp-2 {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          `
        }} />
      </div>
    );
  };

  // Homepage Header (Simple Navigation)
  const renderHomepageHeader = () => (
    <>
      {/* Top Bar */}
      <div className="border-b py-1 relative overflow-hidden" style={{background: `linear-gradient(to right, #FF0023, #CC001C)`, borderBottomColor: '#FF002330'}}>
        <div className="absolute inset-0 animate-pulse" style={{background: `linear-gradient(to right, #FF002305, #FF002305)`}}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-semibold text-gray-100 tracking-wide">
                  <span dangerouslySetInnerHTML={{
                    __html: lang.common.companyTagline.replace(
                      /(SIEMENS|Siemens)/gi, 
                      '<span style="font-family: \'Arial Black\', \'Helvetica\', sans-serif; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">$1</span>'
                    )
                  }} />
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="transform hover:scale-105 transition-transform duration-200">
                <LanguageSwitcher />
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center space-x-2 bg-white hover:bg-gray-50 text-green-600 hover:text-green-700 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border border-gray-300"
              >
                <MessageCircle className="w-4 h-4 group-hover:animate-bounce" />
                <span className="text-xs font-bold hidden sm:inline">Hubungi Kami</span>
                <span className="text-xs font-bold sm:hidden">Hubungi</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Homepage Navigation */}
      <header className="sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 relative group">
                <div onClick={() => router.push("/")} className="cursor-pointer">
                  <Image
                    src="/images/asset-web/logo.png"
                    alt="Hokiindo Raya"
                    width={180}
                    height={50}
                    priority
                    className="h-10 w-auto object-contain md:h-12"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="/" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Home
              </a>
              <a href="/about" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                About
              </a>
              <a href="/projects" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Project & Reference
              </a>
              <a href="/blog" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Blog
              </a>
              <a href="/contact" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Contact
              </a>
            </nav>

            {/* Store Button & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/products')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Visit Store
              </Button>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="lg:hidden p-2 text-gray-700 hover:text-red-600">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="text-left">
                      <div className="flex items-center space-x-2">
                        <div className="relative w-8 h-8">
                          <Image
                            src="/images/asset-web/logo.png"
                            alt="Hokiindo Raya Logo"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-lg font-bold text-gray-900">Hokiindo Raya</span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col h-full overflow-y-auto mt-6">
                    <div className="space-y-1">
                      <a href="/" className="flex items-center p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors">
                        Home
                      </a>
                      <a href="/about" className="flex items-center p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors">
                        About
                      </a>
                      <a href="/projects" className="flex items-center p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors">
                        Project & Reference
                      </a>
                      <a href="/blog" className="flex items-center p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors">
                        Blog
                      </a>
                      <a href="/contact" className="flex items-center p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors">
                        Contact
                      </a>
                      <div className="pt-4">
                        <Button
                          onClick={() => router.push('/products')}
                          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                        >
                          Visit Store
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );

  // Conditional rendering based on page type
  if (isHomepageNavigation) {
    return renderHomepageHeader();
  }

  // Store/E-commerce Header (existing complex header for store pages)
  return (
    <>
      {/* Top Bar - Static (not sticky) */}
      <div className="border-b py-1 relative overflow-hidden" style={{background: `linear-gradient(to right, #FF0023, #CC001C)`, borderBottomColor: '#FF002330'}}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 animate-pulse" style={{background: `linear-gradient(to right, #FF002305, #FF002305)`}}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between">
            {/* Left Section - Company Info */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-semibold text-gray-100 tracking-wide">
                  <span dangerouslySetInnerHTML={{
                    __html: lang.common.companyTagline.replace(
                      /(SIEMENS|Siemens)/gi, 
                      '<span style="font-family: \'Arial Black\', \'Helvetica\', sans-serif; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">$1</span>'
                    )
                  }} />
                </span>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-3">
              {/* Language Switcher */}
              <div className="transform hover:scale-105 transition-transform duration-200">
                <LanguageSwitcher />
              </div>
              
              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center space-x-2 bg-white hover:bg-gray-50 text-green-600 hover:text-green-700 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border border-gray-300"
              >
                <MessageCircle className="w-4 h-4 group-hover:animate-bounce" />
                <span className="text-xs font-bold hidden sm:inline">Hubungi Kami</span>
                <span className="text-xs font-bold sm:hidden">Hubungi</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation - Sticky */}
      <header className="sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 relative group">
                <div
                  onClick={() => router.push("/")}
                  className="cursor-pointer"
                >
                  <Image
                    src="/images/asset-web/logo.png"
                    alt="Hokiindo Raya"
                    width={180}
                    height={50}
                    priority
                    className="h-10 w-auto object-contain md:h-12"
                  />
                </div>
              </div>
            </div>

            {/* Center Section - Categories and Search */}
            <div className="hidden lg:flex items-center flex-1 max-w-4xl mx-6">
              {/* Product Categories Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="mr-3 text-gray-700 hover:text-red-600 font-medium text-sm px-3 py-2 transition-all duration-300 hover:bg-red-50 rounded-lg"
                  >
                    <AlignJustify className="w-4 h-4 mr-2" />
                    <span className="hidden xl:inline">
                      {lang.nav.categories}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-2">
                  <div className="grid grid-cols-1 gap-1">
                    {productCategories.map((category: any, index: number) => (
                      <React.Fragment key={index}>
                        <DropdownMenuItem asChild>
                          <a
                            href={category.href}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors duration-200 cursor-pointer group"
                          >
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                              {category.name}
                            </h4>
                            <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                          </a>
                        </DropdownMenuItem>
                        {index < productCategories.length - 1 && (
                          <DropdownMenuSeparator className="my-1" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild>
                    <a
                      href="/products"
                      className="flex items-center justify-center p-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      Lihat Semua Produk
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Clean Modern Search Bar */}
              <div className="flex-1 relative max-w-2xl mx-auto" ref={searchRef}>
                <div className="relative">
                  <div className="relative flex items-center bg-white rounded-lg border border-gray-300 hover:border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all duration-200 shadow-sm hover:shadow-md">
                    
                    {/* Search Icon */}
                    <div className="flex items-center pl-3">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                      
                    {/* Search Input */}
                      <Input
                        type="text"
                        placeholder={lang.common.search}
                      className="flex-1 h-11 px-3 text-sm bg-transparent border-0 outline-none ring-0 focus-visible:ring-0 placeholder:text-gray-500"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => handleKeyPress(e, false)}
                      />
                      
                    {/* Clear Button */}
                      {searchQuery && !isSearching && (
                        <button
                          onClick={() => clearSearch(false)}
                        className="mr-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
                        >
                        <X className="w-3 h-3" />
                        </button>
                      )}
                      
                    {/* Loading Indicator */}
                      {isSearching && (
                      <div className="mr-2">
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                        </div>
                      )}
                      
                    {/* Search Button */}
                    <button
                      onClick={() => handleSearchSubmit(searchQuery)}
                      className="h-11 px-4 bg-red-600 hover:bg-red-700 text-white rounded-r-lg flex items-center justify-center transition-colors duration-200"
                    >
                      <Search className="w-4 h-4" />
                      <span className="ml-1 text-sm font-medium hidden sm:inline">{lang.common.searchButton}</span>
                    </button>
                  </div>
                </div>
                  

              </div>
              
              {/* Search Results Dropdown */}
              {renderSearchDropdown(searchResults, isSearching, showDropdown, false)}
            </div>

            {/* Tablet Search Bar */}
            <div className="hidden md:flex lg:hidden items-center flex-1 max-w-md mx-4">
              <div className="relative w-full" ref={searchRef}>
                <div className="relative flex items-center bg-white rounded-lg border border-gray-300 hover:border-red-400 focus-within:border-red-500 transition-colors">
                  <div className="flex items-center pl-3">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder={lang.common.search}
                    className="flex-1 h-10 px-2 text-sm bg-transparent border-0 outline-none ring-0 focus-visible:ring-0"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => handleKeyPress(e, false)}
                  />
                  {searchQuery && !isSearching && (
                    <button onClick={() => clearSearch(false)} className="mr-2 p-1">
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                  {isSearching && (
                    <div className="mr-2">
                      <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                    </div>
                  )}
                  <button
                    onClick={() => handleSearchSubmit(searchQuery)}
                    className="h-10 px-3 bg-red-600 hover:bg-red-700 text-white rounded-r-lg"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                

                
                {renderSearchDropdown(searchResults, isSearching, showDropdown, false)}
              </div>
              </div>

            {/* Right Section - Auth, Cart and Mobile Menu */}
            <div className="flex items-center space-x-2">
              {/* Desktop Authentication */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="hidden lg:flex items-center space-x-2 text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 p-1" align="end">
                    <DropdownMenuItem onClick={() => router.push('/dashboard')} className="p-2">
                      <User className="w-4 h-4 mr-2 text-red-600" />
                      <span>{lang.auth.dashboard}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard')} className="p-2">
                      <Settings className="w-4 h-4 mr-2 text-red-600" />
                      <span>{lang.auth.profile}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="p-2">
                      <LogOut className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-red-600">{lang.auth.logout}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => router.push('/login')}
                  variant="outline"
                  className="hidden lg:flex items-center text-red-600 border-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  {lang.nav.login}
                </Button>
              )}

              {/* Mobile Login Button - only show when not logged in */}
              {!user && (
                <Button
                  onClick={() => router.push('/login')}
                  className="lg:hidden bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-red-600 p-2 rounded-lg transition-colors"
                  size="sm"
                >
                  <User className="w-5 h-5" />
                </Button>
              )}

              {/* Shopping Cart */}
              <Button
                onClick={() => router.push('/cart')}
                className="relative bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                size="sm"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* Mobile Menu Toggle */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="lg:hidden p-2 text-gray-700 hover:text-red-600 transition-colors"
                    size="sm"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <SheetHeader className="p-6 border-b border-gray-100">
                    <SheetTitle className="text-left text-xl font-bold text-gray-900">Menu</SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col h-full overflow-y-auto">


                    {/* Categories */}
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">{lang.nav.categories}</h3>
                      <div className="space-y-1">
                        {productCategories.slice(0, 5).map((category: any, index: number) => (
                          <a
                            key={index}
                            href={category.href}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 text-gray-700 hover:text-red-600 transition-all duration-200 group cursor-pointer"
                          >
                            <span className="text-sm font-medium group-hover:font-semibold transition-all duration-200">
                              {category.name}
                            </span>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                          </a>
                        ))}
                        <a
                          href="/products"
                          className="flex items-center justify-center p-3 mt-4 text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 rounded-xl text-sm font-semibold transition-all duration-200 border border-red-200 hover:border-red-300 cursor-pointer"
                        >
                          Lihat Semua Produk
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                      </div>
                    </div>

                    {/* User Menu */}
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Akun</h3>
                      {user ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200/50">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-semibold text-gray-900 block">{user.email?.split('@')[0]}</span>
                              <span className="text-xs text-gray-500">Member Terdaftar</span>
                            </div>
                          </div>
                          <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center space-x-4 w-full p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 text-gray-700 hover:text-gray-900 transition-all duration-200 group cursor-pointer"
                          >
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium">{lang.auth.dashboard}</span>
                            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" />
                          </button>
                          <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center space-x-4 w-full p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 text-gray-700 hover:text-gray-900 transition-all duration-200 group cursor-pointer"
                          >
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                              <Settings className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium">{lang.auth.profile}</span>
                            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" />
                          </button>
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-4 w-full p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 text-red-600 hover:text-red-700 transition-all duration-200 group cursor-pointer mt-2 border-t border-gray-100 pt-4"
                          >
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                              <LogOut className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="text-sm font-medium">{lang.auth.logout}</span>
                            <ArrowRight className="w-4 h-4 text-red-400 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => router.push('/login')}
                          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl h-12 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                        >
                          <User className="w-4 h-4 mr-2" />
                          {lang.nav.login}
                        </Button>
                      )}
                    </div>

                    {/* Additional Links */}
                    <div className="p-6 flex-1">
                      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Lainnya</h3>
                      <div className="space-y-1">
                        <a
                          href="/products"
                          className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 text-gray-700 hover:text-gray-900 transition-all duration-200 group cursor-pointer"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <Package className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium">Produk</span>
                          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" />
                        </a>

                        <a
                          href="/about"
                          className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 text-gray-700 hover:text-gray-900 transition-all duration-200 group cursor-pointer"
                        >
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                            <Building2 className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium">Tentang Kami</span>
                          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" />
                        </a>
                        <a
                          href="/contact"
                          className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 text-gray-700 hover:text-gray-900 transition-all duration-200 group cursor-pointer"
                        >
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                            <MessageCircle className="w-4 h-4 text-orange-600" />
                          </div>
                          <span className="text-sm font-medium">Kontak</span>
                          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" />
                        </a>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 text-green-600 hover:text-green-700 transition-all duration-200 group cursor-pointer border border-green-200 hover:border-green-300 mt-4"
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <MessageCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-semibold">WhatsApp</span>
                          <ArrowRight className="w-4 h-4 text-green-400 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200" />
                        </a>
                      </div>
                      
                      {/* Footer */}
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">© 2025 Hokiindo Raya</p>
                          <p className="text-xs text-gray-400 mt-1">Official SIEMENS Partner</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>


        </div>

        {/* Mobile Search Bar - Sticky */}
        <div className="lg:hidden sticky top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="relative" ref={mobileSearchRef}>
              <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all duration-200 shadow-sm">
                <div className="flex items-center pl-4">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                  <Input
                    type="text"
                  placeholder={lang.common.search}
                  className="flex-1 h-12 px-3 text-sm bg-transparent border-0 ring-0 focus-visible:ring-0 placeholder:text-gray-500"
                    value={mobileSearchQuery}
                    onChange={handleMobileSearchChange}
                    onKeyDown={(e) => handleKeyPress(e, true)}
                  />
                  {mobileSearchQuery && !isMobileSearching && (
                    <button
                      onClick={() => clearSearch(true)}
                    className="mr-3 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    >
                    <X className="w-3 h-3 text-gray-500" />
                    </button>
                  )}
                  {isMobileSearching && (
                  <div className="mr-3">
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    </div>
                  )}
                <button
                  onClick={() => handleSearchSubmit(mobileSearchQuery)}
                  className="h-12 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-r-xl flex items-center justify-center transition-all duration-200 shadow-md"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              {renderSearchDropdown(mobileSearchResults, isMobileSearching, showMobileDropdown, true)}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header; 