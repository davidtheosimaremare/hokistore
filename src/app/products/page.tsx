"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Filter, 
  Grid3X3, 
  List, 
  MessageCircle,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { useLang } from '@/context/LangContext';
import { SupabaseProduct } from '@/hooks/useSupabaseProducts';
import { formatRupiah } from '@/utils/formatters';
import { getDisplayName, getProductCode } from '@/utils/productHelpers';
import { generateSEOProductUrl } from '@/utils/seoHelpers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
type ViewMode = 'grid' | 'list';

const PRODUCTS_PER_PAGE = 14; // Products per page as requested

// Component to handle search params logic
function SearchParamsHandler({ setSearchQuery }: { setSearchQuery: (query: string) => void }) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    setSearchQuery(searchQuery);
  }, [searchQuery, setSearchQuery]);

  return null;
}

const ProductsPageContent = () => {
  const {
    products,
    categories,
    loading,
    error,
    refetch,
    filterByCategory,
    sortProducts,
    searchProducts
  } = useSupabaseProducts();

  const { lang } = useLang();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loadedPages, setLoadedPages] = useState(1); // Track how many pages are loaded for infinite scroll
  const [currentSlide, setCurrentSlide] = useState(0); // For banner slider

  // Handle category filter
  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    filterByCategory(category);
    setLoadedPages(1);
  };

  // Handle sort
  const handleSort = (sort: SortOption) => {
    setSortBy(sort);
    sortProducts(sort);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('all');
    setSortBy('name-asc');
    filterByCategory('all');
    setLoadedPages(1);
    // Note: Search query is handled by URL params, so we don't reset it here
  };

  // Apply search and filters
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => 
      product.name !== 'UNKNOWN' && product.price > 0
    );

    // Apply search filter if there's a search query
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower) ||
        (getProductCode(product) && getProductCode(product)!.toLowerCase().includes(searchLower)) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [products, searchQuery]);

  // Calculate pagination based on filtered products
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const totalProducts = filteredProducts.length;

  // Products to display with infinite scroll (show products from page 1 to loadedPages)
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, loadedPages * PRODUCTS_PER_PAGE);
  }, [filteredProducts, loadedPages]);

  // Load more products (next page)
  const loadMoreProducts = useCallback(() => {
    if (loadedPages < totalPages) {
      setLoadedPages(prev => prev + 1);
    }
  }, [loadedPages, totalPages]);

  // Banner navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  // Banner auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Infinite scroll implementation
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && loadedPages < totalPages) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreProducts, loadedPages, totalPages]);

  // Handle WhatsApp link
  const getWhatsAppLink = (product: SupabaseProduct) => {
    const displayName = getDisplayName(product);
    const productCode = getProductCode(product);
    const stockStatus = product.stock_quantity > 0 ? 'Ready Stock' : 'Indent';
    const message = `Halo, saya ingin menanyakan ketersediaan produk:

Nama: ${displayName}
${productCode ? `Kode: ${productCode}` : ''}
Status: ${stockStatus}
${product.category ? `Kategori: ${product.category}` : ''}

${product.stock_quantity <= 0 ? 'Mohon informasi untuk stock dan waktu pengiriman.' : 'Mohon informasi lebih lanjut.'}`;
    
    return `https://wa.me/628111086180?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={null}>
        <SearchParamsHandler setSearchQuery={setSearchQuery} />
      </Suspense>
      <Header />
      
      {/* Banner Slider */}
      <section className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="overflow-hidden rounded-xl relative">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {/* Slide 1 */}
                <div className="w-full flex-shrink-0">
                  <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 rounded-xl overflow-hidden">
                    <img
                      src="/images/asset-web/product-banner-1.png"
                      alt="Product Banner 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Slide 2 */}
                <div className="w-full flex-shrink-0">
                  <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 rounded-xl overflow-hidden">
                    <img
                      src="/images/asset-web/product-banner-2.png"
                      alt="Product Banner 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Slide 3 */}
                <div className="w-full flex-shrink-0">
                  <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 rounded-xl overflow-hidden">
                    <img
                      src="/images/asset-web/product-banner-3.png"
                      alt="Product Banner 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Previous Button */}
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Next Button */}
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            {/* Navigation Dots */}
            <div className="flex justify-center mt-4 space-x-2">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile Filter Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-3">
            <div className="flex items-center justify-between space-x-4">
              
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">{lang.products.filter}</span>
                <ChevronDown className={`w-4 h-4 transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-500'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-500'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Product Count */}
              <div className="text-xs text-gray-600">
                {totalProducts} {lang.products.foundProducts}
              </div>
            </div>

            {/* Mobile Filter Content */}
            {showMobileFilters && (
              <div className="mt-4 pb-2 space-y-4 border-t border-gray-100 pt-4">
                
                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">{lang.products.category}</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">{lang.products.allCategories}</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">{lang.products.sort}</label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value as SortOption)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="name-asc">{lang.products.sortByNameAsc}</option>
                    <option value="name-desc">{lang.products.sortByNameDesc}</option>
                    <option value="price-asc">{lang.products.sortByPriceAsc}</option>
                    <option value="price-desc">{lang.products.sortByPriceDesc}</option>
                  </select>
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetFilters}
                  className="w-full text-red-600 hover:text-red-700 font-medium flex items-center justify-center space-x-2 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>{lang.products.resetFilter}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar - Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              
              {/* Filter Content - Desktop Only */}
              <div className="space-y-6">
                
                {/* View Mode Toggle */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">{lang.products.viewMode}</h3>
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 p-2 rounded-md transition-colors text-center ${
                        viewMode === 'grid' 
                          ? 'bg-white text-red-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 p-2 rounded-md transition-colors text-center ${
                        viewMode === 'list' 
                          ? 'bg-white text-red-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <List className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">{lang.products.category}</h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">{lang.products.allCategories}</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">{lang.products.sort}</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value as SortOption)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="name-asc">{lang.products.sortByNameAsc}</option>
                    <option value="name-desc">{lang.products.sortByNameDesc}</option>
                    <option value="price-asc">{lang.products.sortByPriceAsc}</option>
                    <option value="price-desc">{lang.products.sortByPriceDesc}</option>
                  </select>
                </div>

                {/* Reset Filters */}
                <button
                  onClick={resetFilters}
                  className="w-full text-red-600 hover:text-red-700 font-medium flex items-center justify-center space-x-2 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>{lang.products.resetFilter}</span>
                </button>

                {/* Products Count */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {lang.products.showingProducts} {visibleProducts.length} dari {totalProducts} {lang.products.moreProducts}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Halaman {loadedPages} dari {totalPages}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Products */}
          <div className="flex-1" id="products-section">
            
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {searchQuery ? lang.products.searchResults : lang.products.allProducts}
                  </h1>
                  {searchQuery && (
                    <p className="text-gray-600">
                      {lang.products.searchResultsFor} "<span className="font-medium text-gray-900">{searchQuery}</span>" 
                      {totalProducts > 0 && <span> - {totalProducts} {lang.products.productsFound}</span>}
                    </p>
                  )}
                  {!searchQuery && (
                    <p className="text-gray-600">
                      {lang.products.showingProducts} {totalProducts} {lang.products.productsAvailable}
                    </p>
                  )}
                </div>
                {searchQuery && (
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/products');
                      window.location.reload();
                    }}
                    className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center space-x-1 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>{lang.products.clearSearch}</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">{lang.products.loading}</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">{lang.products.error}</h3>
                  <p className="text-red-600 mb-4 text-sm">{error}</p>
                  <button
                    onClick={refetch}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {lang.products.retry}
                  </button>
                </div>
              </div>
            )}

            {/* No Products Found */}
            {!loading && !error && totalProducts === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  {searchQuery ? (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {lang.products.noSearchResults}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {lang.products.searchSuggestion} "{searchQuery}".
                        <br />{lang.products.tryDifferentKeywords}
                      </p>
                      <div className="space-x-3">
                        <button
                          onClick={() => window.history.pushState({}, '', '/products')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                          {lang.products.removeSearch}
                        </button>
                        <button
                          onClick={resetFilters}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                          {lang.products.resetFilters}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{lang.products.noProductsFound}</h3>
                      <p className="text-gray-600 mb-4">{lang.products.changeFilter}</p>
                      <button
                        onClick={resetFilters}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        {lang.products.resetFilter}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && visibleProducts.length > 0 && (
              <>
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {visibleProducts.map((product) => (
                    <Link 
                      key={product.id} 
                      href={generateSEOProductUrl(product.id, getDisplayName(product))}
                      className={`bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                        viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'
                      }`}
                    >
                      
                      {/* Product Image */}
                      <div className={`relative overflow-hidden ${
                        viewMode === 'list' ? 'w-32 flex-shrink-0' : 'aspect-square w-full'
                      }`}>
                        <img 
                          src={product.admin_thumbnail || "https://placehold.co/400x400/f8fafc/64748b?text=Product+Image"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Stock Status Badge Overlay */}
                        <div className="absolute top-2 left-2">
                          {product.stock_quantity > 0 ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full shadow-sm">
                              {lang.products.stock}: {product.stock_quantity} {product.unit || 'pcs'}
                            </span>
                          ) : (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full shadow-sm">
                              {lang.products.indent}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Product Content */}
                      <div className="p-4 flex-1">
                        
                        {/* Product Name */}
                        <h3 className="font-semibold text-xs text-gray-900 mb-2 line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        
                        {/* Category */}
                        {product.category && product.category !== 'Umum' && (
                          <p className="text-xs text-gray-600 mb-1">
                            {lang.products.category}: {product.category}
                          </p>
                        )}
                        
                        {/* Product Code */}
                        {getProductCode(product) && (
                          <p className="text-xs font-mono text-gray-500 mb-2">
                            {lang.products.productCode}: {getProductCode(product)}
                          </p>
                        )}
                        
                        {/* Price */}
                        <div className="mb-3">
                          <span className="text-lg font-bold text-red-600">
                            {product.price > 0 ? formatRupiah(product.price) : lang.products.contactForPrice}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                {loadedPages < totalPages && (
                  <div 
                    ref={loadMoreRef}
                    className="flex items-center justify-center py-8"
                  >
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                    <span className="ml-2 text-gray-600">{lang.products.loadMore}...</span>
                  </div>
                )}

                {/* Load More Button (Alternative to infinite scroll) */}
                {loadedPages < totalPages && (
                  <div className="text-center py-6">
                    <button
                      onClick={loadMoreProducts}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Load More Products ({PRODUCTS_PER_PAGE} more)
                    </button>
                  </div>
                )}

                {/* End of Products Indicator */}
                {loadedPages >= totalPages && totalProducts > PRODUCTS_PER_PAGE && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Semua produk telah dimuat ({totalProducts} produk)</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Main component wrapper with Suspense
const ProductsPage = () => {
  return <ProductsPageContent />;
};

export default ProductsPage;