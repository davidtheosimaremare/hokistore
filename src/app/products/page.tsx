"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid3X3, 
  List, 
  ShoppingCart, 
  MessageCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeaturedBanner from '@/components/FeaturedBanner';
import ProductCard from '@/components/ProductCard';
import { AccurateApiService, AccurateProduct } from '@/services/accurateApi';
import { formatRupiah } from '@/utils/formatters';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LangContext';
import Link from 'next/link';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
type ViewMode = 'grid' | 'list';

const ProductsPage = () => {
  const { lang } = useLang();
  const [products, setProducts] = useState<AccurateProduct[]>([]);
  const [allProducts, setAllProducts] = useState<AccurateProduct[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<AccurateProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 50;

  // Load all products initially
  const loadAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading ALL products from Accurate API (8000+ products)...');
      
      // Use the new getAllProductsPaginated method to fetch all products
      const allProducts = await AccurateApiService.getAllProductsPaginated();
      
      console.log(`🎉 Successfully loaded ${allProducts.length} products from Accurate API`);
      
      if (allProducts.length === 0) {
        throw new Error('No products found from Accurate API');
      }
      
      setAllProducts(allProducts);
      setProducts(allProducts);

      // Extract unique categories with better handling
      const uniqueCategories = Array.from(
        new Set(
          allProducts
            .map(product => product.itemCategory?.name || product.itemTypeName || 'Uncategorized')
            .filter((name): name is string => Boolean(name))
        )
      ).sort();
      
      setCategories(uniqueCategories);
      
      console.log(`✅ Successfully processed ${allProducts.length} products`);
      console.log(`📂 Available categories (${uniqueCategories.length}):`, uniqueCategories);
      
    } catch (err) {
      console.error('❌ Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products from Accurate API');
      
      // Fallback: try the old method as backup
      try {
        console.log('🔄 Trying fallback method...');
        const [searchResults, regularProducts] = await Promise.all([
          AccurateApiService.searchProductsComprehensive('').catch(() => []),
          AccurateApiService.getProducts({ limit: 5000 }).catch(() => [])
        ]);
        
        const combinedProducts = [...searchResults, ...regularProducts];
        const uniqueProducts = combinedProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        );
        
        if (uniqueProducts.length > 0) {
          console.log(`⚠️ Fallback successful: ${uniqueProducts.length} products loaded`);
          setAllProducts(uniqueProducts);
          setProducts(uniqueProducts);
          
          const uniqueCategories = Array.from(
            new Set(
              uniqueProducts
                .map(product => product.itemCategory?.name || product.itemTypeName || 'Uncategorized')
                .filter((name): name is string => Boolean(name))
            )
          ).sort();
          
          setCategories(uniqueCategories);
          setError(null); // Clear error since fallback worked
        }
      } catch (fallbackErr) {
        console.error('❌ Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort products
  const filterAndSortProducts = useCallback(() => {
    let filtered = [...allProducts];

    // Apply category filter - check both itemCategory.name and itemTypeName
    if (selectedCategory && selectedCategory !== 'Uncategorized') {
      filtered = filtered.filter(product => {
        const categoryName = product.itemCategory?.name || product.itemTypeName;
        return categoryName === selectedCategory;
      });
    } else if (selectedCategory === 'Uncategorized') {
      filtered = filtered.filter(product => {
        const categoryName = product.itemCategory?.name || product.itemTypeName;
        return !categoryName || categoryName === 'Uncategorized';
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return (a.unitPrice || 0) - (b.unitPrice || 0);
        case 'price-desc':
          return (b.unitPrice || 0) - (a.unitPrice || 0);
        default:
          return 0;
      }
    });

    setProducts(filtered);
    setHasMore(filtered.length > ITEMS_PER_PAGE * 2);
    
    // Display more products initially for better performance
    const initialProducts = filtered.slice(0, ITEMS_PER_PAGE * 2); // Show 2 pages worth initially
    setDisplayedProducts(initialProducts);
    setPage(1); // Start at page 1 since we've already shown 2 pages worth
  }, [allProducts, selectedCategory, sortBy]);

  // Load more products for infinite scroll
  const loadMoreProducts = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    
    // Remove artificial delay for instant loading
    const nextPage = page + 1;
    const startIndex = nextPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newProducts = products.slice(startIndex, endIndex);
    
    if (newProducts.length > 0) {
      setDisplayedProducts(prev => [...prev, ...newProducts]);
      setPage(nextPage);
      setHasMore(endIndex < products.length);
    } else {
      setHasMore(false);
    }
    
    setLoadingMore(false);
  }, [page, products, loadingMore, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.5 }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMoreProducts, hasMore, loadingMore]);

  // Load products on mount
  useEffect(() => {
    loadAllProducts();
  }, [loadAllProducts]);

  // Apply filters when they change
  useEffect(() => {
    if (allProducts.length > 0) {
      filterAndSortProducts();
    }
  }, [filterAndSortProducts, allProducts.length]);

  // Handle add to cart
  const handleAddToCart = (product: AccurateProduct) => {
    addToCart(product, 1);
    // You could add a toast notification here
  };

  // Get WhatsApp link for out of stock products
  const getWhatsAppLink = (product: AccurateProduct) => {
    const message = `Halo, saya ingin menanyakan ketersediaan stok untuk produk: ${product.name} (ID: ${product.id})`;
    return `https://wa.me/628111086180?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">{lang.products.loading}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{lang.products.error}</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={loadAllProducts}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                {lang.products.retry}
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Products Banner */}
        <div className="mb-8">
          <FeaturedBanner products={allProducts} />
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{lang.products.title}</h1>
          <p className="text-gray-600">
            {lang.products.showingProducts} {displayedProducts.length} {lang.common.loading === 'Loading...' ? 'dari' : 'of'} {products.length} {lang.products.title.toLowerCase()}
            {selectedCategory && ` ${lang.common.loading === 'Loading...' ? 'dalam kategori' : 'in category'} "${selectedCategory}"`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                {lang.products.filter} & {lang.products.category}
              </h2>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{lang.products.category}</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      {lang.products.allCategories} ({allProducts.length})
                    </span>
                  </label>
                  {categories.map((category) => {
                    const categoryCount = allProducts.filter(p => {
                      const productCategory = p.itemCategory?.name || p.itemTypeName || 'Uncategorized';
                      return productCategory === category;
                    }).length;
                    return (
                      <label key={category} className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-50">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 flex-1">
                          {category}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {categoryCount}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{lang.products.sort}</h3>
                <div className="space-y-2">
                  {[
                    { value: 'name-asc', label: lang.products.sortByNameAsc },
                    { value: 'name-desc', label: lang.products.sortByNameDesc },
                    { value: 'price-asc', label: lang.products.sortByPriceAsc },
                    { value: 'price-desc', label: lang.products.sortByPriceDesc }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-50">
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={sortBy === option.value}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSortBy('name-asc');
                }}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                {lang.products.resetFilter}
              </button>
            </div>
          </div>

          {/* Right Content - Products */}
          <div className="flex-1 min-w-0">
            {/* View Mode Toggle and Product Count */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {displayedProducts.length > 0 && (
                    <>
                      {lang.products.showingProducts} {displayedProducts.length} produk
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 mr-2">{lang.products.viewMode}:</span>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {displayedProducts.length > 0 ? (
              <div className={`${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-3'
              }`}>
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onAddToCart={handleAddToCart}
                    getWhatsAppLink={getWhatsAppLink}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {lang.products.noProductsFound}
                </h3>
                <p className="text-gray-600 mb-6">
                  {lang.products.changeFilter}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSortBy('name-asc');
                  }}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  {lang.products.resetFilter}
                </button>
              </div>
            )}

            {/* Infinite Scroll Loading Trigger */}
            <div ref={loadingRef} className="py-8">
              {loadingMore && (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-red-600 mr-2" />
                  <span className="text-gray-600">{lang.products.loadingMore}</span>
                </div>
              )}
              {!hasMore && displayedProducts.length > 0 && (
                <div className="text-center text-gray-500">
                  <p>{lang.products.allProductsLoaded}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductsPage; 