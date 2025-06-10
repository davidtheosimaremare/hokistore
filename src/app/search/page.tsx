"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ShoppingCart, 
  MessageCircle,
  Loader2,
  ArrowLeft,
  ChevronDown,
  Package,
  AlertTriangle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { formatRupiah } from '@/utils/formatters';
import { generateSEOProductUrl } from '@/utils/seoHelpers';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
type ViewMode = 'grid' | 'list';

// Interface for Supabase products
interface SupabaseProduct {
  id: number
  name: string
  description?: string
  short_description?: string
  price: number
  original_price?: number
  stock_quantity: number
  unit: string
  category: string
  sku?: string
  accurate_code?: string
  brand?: string
  status: string
  is_published: boolean
  is_available_online: boolean
  admin_thumbnail?: string
}

interface ProductCardProps {
  product: SupabaseProduct;
  viewMode: ViewMode;
  onAddToCart: (product: SupabaseProduct) => void;
  getWhatsAppLink: (product: SupabaseProduct) => string;
}

// Component to handle search params logic
function SearchParamsHandler({ setQuery }: { setQuery: (query: string) => void }) {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  useEffect(() => {
    setQuery(query);
  }, [query, setQuery]);

  return null;
}

const SearchPageContent = ({ query }: { query: string }) => {
  const router = useRouter();
  
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SupabaseProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(query);
  
  const { addToCart } = useCart();

  // Load search results from Supabase
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setFilteredProducts([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [SEARCH-PAGE] Searching products in Supabase for:', searchQuery);
      
      // Search products in Supabase database - only name and category (case insensitive)
      const { data: searchResults, error: searchError } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .eq('is_published', true)
        .eq('is_available_online', true)
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (searchError) {
        throw new Error(searchError.message);
      }

      console.log(`✅ [SEARCH-PAGE] Found ${searchResults?.length || 0} products in Supabase`);

      const results = searchResults || [];
      setProducts(results);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(
        results
          .map(p => p.category)
          .filter(Boolean)
          .filter((name): name is string => typeof name === 'string')
      )];
      setCategories(uniqueCategories);
      
    } catch (error: any) {
      console.error('❌ [SEARCH-PAGE] Error searching products:', error);
      setError(error.message || 'Gagal mencari produk');
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort products
  const filterAndSortProducts = useCallback(() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        product => product.category === selectedCategory
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortBy]);

  // Handle new search
  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  // Load search results when query changes
  useEffect(() => {
    if (query) {
      performSearch(query);
      setSearchInput(query);
    } else {
      setProducts([]);
      setFilteredProducts([]);
      setCategories([]);
      setLoading(false);
    }
  }, [query, performSearch]);

  // Apply filters when they change
  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  // Handle add to cart
  const handleAddToCart = (product: SupabaseProduct) => {
    // Convert Supabase product to cart format
    const cartItem = {
      id: product.id.toString(),
      name: product.name,
      price: product.price || 0,
      image: product.admin_thumbnail,
      unit: product.unit,
      brand: product.brand,
      category: product.category
    };
    addToCart(cartItem, 1);
  };

  // Get WhatsApp link for out of stock products
  const getWhatsAppLink = (product: SupabaseProduct) => {
    const message = `Halo, saya ingin menanyakan ketersediaan stok untuk produk: ${product.name} (ID: ${product.id})`;
    return `https://wa.me/628111086180?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Mencari produk: "{query}"</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali
            </button>
          </div>

          {/* New Search Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <form onSubmit={handleNewSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau kategori produk..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Cari</span>
              </button>
            </form>
          </div>

          {/* Search Results Info */}
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hasil Pencarian
            </h1>
            {query && (
              <p className="text-gray-600 mb-2">
                Pencarian untuk: <span className="font-semibold text-red-600">"{query}"</span>
              </p>
            )}
            <p className="text-gray-600">
              Ditemukan {filteredProducts.length} dari {products.length} produk
              {selectedCategory && ` dalam kategori "${selectedCategory}"`}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => performSearch(query)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Filters and Controls */}
        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              
              {/* Left side - Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Category Filter */}
                {categories.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Semua Kategori</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                )}

                {/* Sort Options */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="name-asc">Nama A-Z</option>
                    <option value="name-desc">Nama Z-A</option>
                    <option value="price-asc">Harga Terendah</option>
                    <option value="price-desc">Harga Tertinggi</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Right side - View Toggle */}
              <div className="flex items-center space-x-2">
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
        )}

        {/* Search Results */}
        {!query ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Masukkan kata kunci pencarian</h3>
              <p className="text-gray-600">
                Gunakan form pencarian di atas untuk mencari produk
              </p>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }`}>
            {filteredProducts.map((product) => (
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
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak ada produk ditemukan
              </h3>
              <p className="text-gray-600 mb-4">
                Tidak ditemukan produk yang sesuai dengan pencarian "{query}"
                {selectedCategory && ` dalam kategori "${selectedCategory}"`}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSortBy('name-asc');
                  }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset Filter
                </button>
                <Link
                  href="/products"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-center"
                >
                  Lihat Semua Produk
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

// Product Card Component (same as in products page)
interface ProductCardProps {
  product: SupabaseProduct;
  viewMode: ViewMode;
  onAddToCart: (product: SupabaseProduct) => void;
  getWhatsAppLink: (product: SupabaseProduct) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode, 
  onAddToCart, 
  getWhatsAppLink 
}) => {
  const hasStock = (product.stock_quantity || 0) > 0;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <img 
              src="https://placehold.co/80x80/f3f4f6/9ca3af?text=Product"
              alt={product.name}
              className="w-16 h-16 object-contain"
            />
            <div className="absolute -top-1 -right-1">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                hasStock ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {hasStock ? 'Tersedia' : 'Indent'}
              </span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <Link 
              href={generateSEOProductUrl(product.id, product.name)}
              className="block hover:text-red-600 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
            </Link>
            
            {product.short_description && (
              <p className="text-sm text-gray-500 mt-1">{product.short_description}</p>
            )}
            
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-lg font-bold text-red-600">
                {formatRupiah(product.price || 0)}
              </span>
              
              {product.category && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {product.category}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            {hasStock ? (
              <button
                onClick={() => onAddToCart(product)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            ) : (
              <a
                href={getWhatsAppLink(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat untuk Stok</span>
              </a>
            )}
            
            <Link
              href={generateSEOProductUrl(product.id, product.name)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm"
            >
              Detail
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-square bg-gray-100">
        <img 
          src="https://placehold.co/300x300/f3f4f6/9ca3af?text=Product"
          alt={product.name}
          className="w-full h-full object-contain p-4"
        />
        
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            hasStock ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {hasStock ? 'Tersedia' : 'Indent'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <Link 
          href={generateSEOProductUrl(product.id, product.name)}
          className="block hover:text-red-600 transition-colors"
        >
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        
        {product.short_description && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-1">{product.short_description}</p>
        )}
        
        {product.category && (
          <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs mb-3">
            {product.category}
          </span>
        )}
        
        <div className="mb-4">
          <span className="text-xl font-bold text-red-600">
            {formatRupiah(product.price || 0)}
          </span>
        </div>
        
        <div className="space-y-2">
          {hasStock ? (
            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <a
              href={getWhatsAppLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat untuk Stok</span>
            </a>
          )}
          
          <Link
            href={generateSEOProductUrl(product.id, product.name)}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-center block"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

// Wrapper component to manage state
const SearchPageWrapper = () => {
  const [query, setQuery] = useState('');

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler setQuery={setQuery} />
      </Suspense>
      <SearchPageContent query={query} />
    </>
  );
};

const SearchPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading search...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <SearchPageWrapper />
    </Suspense>
  );
};

export default SearchPage; 