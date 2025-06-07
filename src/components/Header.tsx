"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Package
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
import { AccurateApiService } from "@/services/accurateApi";
import { formatRupiah } from "@/utils/formatters";
import { useCart } from "@/context/CartContext";

const Header = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [mobileSearchResults, setMobileSearchResults] = useState<any[]>([]);
  const [isMobileSearching, setIsMobileSearching] = useState(false);
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  
  const { lang } = useLang();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { state: cartState } = useCart();
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

  // Debounced search function
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
      
      // Use comprehensive search across multiple fields (name, id, brand, category, etc.)
      const results = await AccurateApiService.searchProductsComprehensive(query);
      
      // Only show dropdown if there are results
      if (results.length > 0) {
        setResults(results);
        setDropdown(true);
      } else {
        setResults([]);
        setDropdown(false);
      }
    } catch (error) {
      console.error('Search error:', error);
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
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
      setShowMobileDropdown(false);
      setSearchQuery("");
      setMobileSearchQuery("");
    }
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
  const renderSearchDropdown = (results: any[], isLoading: boolean, isVisible: boolean) => {
    if (!isVisible && !isLoading) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            <span className="ml-2 text-gray-600">Mencari produk...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="py-2">
            {results.map((product) => (
              <button
                key={product.id}
                onClick={() => handleResultClick(product.id)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {product.no} | {product.itemCategoryName || 'Kategori tidak tersedia'}
                    </p>
                    {product.unitPrice && (
                      <p className="text-sm font-semibold text-red-600 mt-1">
                        {formatRupiah(product.unitPrice)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 py-2 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between">
            {/* Left Section - Company Info */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600">
                  {lang.common.companyTagline}
                </span>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-2">
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-3.5 h-3.5 group-hover:animate-bounce" />
                <span className="text-xs font-medium hidden sm:inline">WhatsApp</span>
                <span className="text-xs font-medium sm:hidden">WA</span>
              </a>

              {/* Support Badge */}
              <div className="hidden lg:flex items-center space-x-1.5 bg-blue-50 border border-blue-200 rounded-md px-2 py-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-blue-600">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div
                  onClick={() => router.push("/")}
                  className="cursor-pointer"
                >
                  <Image
                    src="/images/asset-web/logo.png"
                    alt="Hokiindo Raya"
                    width={100}
                    height={25}
                    priority
                    className="h-7 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Center Section - Categories and Search */}
            <div className="hidden md:flex items-center flex-1 max-w-3xl mx-6">
              {/* Product Categories Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="mr-6 text-gray-700 hover:text-red-600 font-medium text-sm px-4 py-2"
                  >
                    <AlignJustify className="w-4 h-4 mr-3" />
                    {lang.nav.categories}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-2">
                  <div className="grid grid-cols-1 gap-1">
                    {productCategories.map((category: any, index: number) => (
                      <React.Fragment key={index}>
                        <DropdownMenuItem asChild>
                          <a
                            href={category.href}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-red-50 transition-colors duration-200 cursor-pointer group"
                          >
                            {/* Icon Container */}
                            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
                              <span className="text-red-600 group-hover:text-red-700">
                                {category.icon}
                              </span>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                                  {category.name}
                                </h4>
                                <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                              </div>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                {category.description}
                              </p>
                            </div>
                          </a>
                        </DropdownMenuItem>
                        {index < productCategories.length - 1 && (
                          <DropdownMenuSeparator className="my-1" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  {/* View All Categories Footer */}
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild>
                    <a
                      href="/products"
                      className="flex items-center justify-center p-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      {lang.products.viewAllCategories}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search Bar with Button */}
              <div className="flex-1 relative" ref={searchRef}>
                <div
                  className={`relative flex items-center transition-all duration-200 ${
                    isSearchFocused ? "scale-[1.02]" : ""
                  }`}
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder={lang.common.search}
                      className="pl-10 pr-10 py-3 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium placeholder:font-normal"
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={(e) => handleKeyPress(e, false)}
                    />
                    
                    {/* Loading spinner or clear button */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : searchQuery && (
                        <button
                          onClick={() => clearSearch(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Search Results Dropdown */}
                {renderSearchDropdown(searchResults, isSearching, showDropdown)}
              </div>
            </div>

            {/* Right Section - WhatsApp, Auth and Cart */}
            <div className="flex items-center space-x-3">
              {/* Mobile Search */}
              <div className="md:hidden">
                <Button variant="ghost" size="sm" className="p-2">
                  <Search className="w-5 h-5 text-gray-600" />
                </Button>
              </div>

              {/* Authentication Section */}
              {user ? (
                // User Menu when logged in
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-red-600 px-3 py-2"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <User className="w-4 h-4 mr-2" />
                      {lang.auth.dashboard}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <Settings className="w-4 h-4 mr-2" />
                      {lang.auth.profile}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {lang.auth.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Login Button when not logged in
                <Button
                  onClick={() => router.push('/auth')}
                  className="hidden md:flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-semibold"
                >
                  {lang.nav.login}
                </Button>
              )}

              {/* Shopping Cart */}
              <Button
                onClick={() => router.push('/cart')}
                className="relative bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white p-2.5 rounded-lg transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                size="sm"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                  {cartState.totalItems}
                </span>
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4" ref={mobileSearchRef}>
            <div className="relative flex items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={lang.common.searchMobile}
                  className="pl-10 pr-16 py-3 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium placeholder:font-normal"
                  onFocus={() => setIsMobileSearchFocused(true)}
                  onBlur={() => setIsMobileSearchFocused(false)}
                  value={mobileSearchQuery}
                  onChange={handleMobileSearchChange}
                  onKeyDown={(e) => handleKeyPress(e, true)}
                />
                
                {/* Mobile search loading/clear button */}
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  {isMobileSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                  ) : mobileSearchQuery && (
                    <button
                      onClick={() => clearSearch(true)}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleSearchSubmit(mobileSearchQuery)}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-md transition-all duration-300"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Mobile Search Results Dropdown */}
            {renderSearchDropdown(mobileSearchResults, isMobileSearching, showMobileDropdown)}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 