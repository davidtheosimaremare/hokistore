import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface SupabaseProduct {
  // Primary Key
  id: string;
  
  // Accurate Integration
  accurate_id?: string;
  accurate_code?: string;
  
  // Basic Product Info
  name: string;
  description?: string;
  short_description?: string;
  
  // Pricing
  price: number;
  cost_price?: number;
  retail_price?: number;
  wholesale_price?: number;
  
  // Inventory
  stock_quantity: number;
  min_stock?: number;
  max_stock?: number;
  unit?: string;
  
  // Categorization
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  series?: string;
  
  // Technical Specifications
  specifications?: any;
  features?: string[];
  dimensions?: string;
  weight?: number;
  
  // Media
  images?: string[];
  thumbnail?: string;
  admin_thumbnail?: string;
  admin_slide_images?: string[];
  brochure_url?: string;
  manual_url?: string;
  
  // SEO & Marketing
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  
  // Status & Visibility
  status: 'active' | 'inactive' | 'discontinued' | 'out_of_stock';
  is_featured?: boolean;
  is_new?: boolean;
  is_bestseller?: boolean;
  is_published?: boolean;
  is_available_online?: boolean;
  display_order?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_sync_accurate?: string;
}

interface UseSupabaseProductsReturn {
  products: SupabaseProduct[];
  allProducts: SupabaseProduct[];
  categories: string[];
  brands: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  searchProducts: (query: string) => void;
  filterByCategory: (category: string) => void;
  filterByBrand: (brand: string) => void;
  sortProducts: (sortBy: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc') => void;
}

export const useSupabaseProducts = (): UseSupabaseProductsReturn => {
  const [allProducts, setAllProducts] = useState<SupabaseProduct[]>([]);
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching ALL products from Supabase with pagination...');

      const PAGE_SIZE = 1000;
      let allData: any[] = [];
      let currentPage = 0;
      let hasMore = true;

      // Get total count first
      const { count: totalCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      console.log(`📊 Total products in database: ${totalCount}`);

      // Fetch all data with pagination
      while (hasMore) {
        const from = currentPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        console.log(`📦 Fetching page ${currentPage + 1} (${from + 1}-${Math.min(to + 1, totalCount || 0)})...`);

        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*')
          .range(from, to)
          .order('created_at', { ascending: false });

        if (supabaseError) {
          throw new Error(`Supabase error: ${supabaseError.message}`);
        }

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          currentPage++;
          
          // Check if we have more data
          hasMore = data.length === PAGE_SIZE;
        } else {
          hasMore = false;
        }
      }

      console.log(`✅ Successfully fetched ${allData.length} products using pagination`);

      if (!allData || allData.length === 0) {
        console.warn('⚠️ No products found in Supabase');
        setAllProducts([]);
        setProducts([]);
        setCategories([]);
        setBrands([]);
        return;
      }

      // Transform data to ensure consistent structure - map directly to database fields
      const transformedProducts: SupabaseProduct[] = allData.map((item, index) => {
        // Log field mapping for first few items
        if (index < 3) {
          console.log(`🔍 Product ${index + 1} raw data:`, {
            id: item.id,
            name: item.name,
            brand: item.brand,
            category: item.category,
            price: item.price,
            stock_quantity: item.stock_quantity,
            status: item.status,
            admin_thumbnail: item.admin_thumbnail
          });
        }

        return {
          // Primary Key
          id: item.id,
          
          // Accurate Integration
          accurate_id: item.accurate_id,
          accurate_code: item.accurate_code,
          
          // Basic Product Info
          name: item.name || `Product ${item.id}`,
          description: item.description,
          short_description: item.short_description,
          
          // Pricing
          price: parseFloat(item.price) || 0,
          cost_price: item.cost_price ? parseFloat(item.cost_price) : undefined,
          retail_price: item.retail_price ? parseFloat(item.retail_price) : undefined,
          wholesale_price: item.wholesale_price ? parseFloat(item.wholesale_price) : undefined,
          
          // Inventory
          stock_quantity: parseInt(item.stock_quantity) || 0,
          min_stock: item.min_stock ? parseInt(item.min_stock) : undefined,
          max_stock: item.max_stock ? parseInt(item.max_stock) : undefined,
          unit: item.unit || 'pcs',
          
          // Categorization
          category: item.category || 'Umum',
          subcategory: item.subcategory,
          brand: item.brand || 'Siemens',
          model: item.model,
          series: item.series,
          
          // Technical Specifications
          specifications: item.specifications,
          features: item.features,
          dimensions: item.dimensions,
          weight: item.weight ? parseFloat(item.weight) : undefined,
          
          // Media
          images: item.images,
          thumbnail: item.thumbnail,
          admin_thumbnail: item.admin_thumbnail,
          admin_slide_images: item.admin_slide_images,
          brochure_url: item.brochure_url,
          manual_url: item.manual_url,
          
          // SEO & Marketing
          slug: item.slug,
          meta_title: item.meta_title,
          meta_description: item.meta_description,
          keywords: item.keywords,
          seo_title: item.seo_title,
          seo_description: item.seo_description,
          seo_keywords: item.seo_keywords,
          
          // Status & Visibility
          status: item.status || 'active',
          is_featured: item.is_featured || false,
          is_new: item.is_new || false,
          is_bestseller: item.is_bestseller || false,
          is_published: item.is_published || false,
          is_available_online: item.is_available_online || true,
          display_order: item.display_order || 0,
          
          // Timestamps
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          last_sync_accurate: item.last_sync_accurate
        };
      });

      // Extract unique categories and brands (filter out empty values)
      const uniqueCategories = Array.from(
        new Set(
          transformedProducts
            .map(p => p.category)
            .filter((cat): cat is string => Boolean(cat && cat.trim()))
        )
      ).sort();

      const uniqueBrands = Array.from(
        new Set(
          transformedProducts
            .map(p => p.brand)
            .filter((brand): brand is string => Boolean(brand && brand.trim()))
        )
      ).sort();

      setAllProducts(transformedProducts);
      setProducts(transformedProducts);
      setCategories(uniqueCategories);
      setBrands(uniqueBrands);

      // Comprehensive logging
      console.log(`✅ Successfully loaded ${transformedProducts.length} products from Supabase`);
      console.log(`📊 Database count: ${totalCount}, Fetched: ${transformedProducts.length}`);
      console.log(`📂 Categories (${uniqueCategories.length}):`, uniqueCategories);
      console.log(`🏷️ Brands (${uniqueBrands.length}):`, uniqueBrands);
      
      // Summary statistics
      const productsWithImages = transformedProducts.filter(p => p.admin_thumbnail).length;
      const productsWithPrices = transformedProducts.filter(p => p.price > 0).length;
      const productsInStock = transformedProducts.filter(p => p.stock_quantity > 0).length;
      const productsWithCodes = transformedProducts.filter(p => p.accurate_code).length;
      const publishedProducts = transformedProducts.filter(p => p.is_published).length;
      
      console.log(`📈 Data Summary:
        - Products with admin thumbnails: ${productsWithImages}/${transformedProducts.length}
        - Products with prices: ${productsWithPrices}/${transformedProducts.length}
        - Products in stock: ${productsInStock}/${transformedProducts.length}
        - Products with Accurate codes: ${productsWithCodes}/${transformedProducts.length}
        - Published products: ${publishedProducts}/${transformedProducts.length}
      `);

      // Log first few product names for verification
      console.log('📝 First 5 products:', transformedProducts.slice(0, 5).map(p => ({ 
        name: p.name, 
        brand: p.brand, 
        category: p.category,
        price: p.price,
        status: p.status 
      })));

    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setAllProducts([]);
      setProducts([]);
      setCategories([]);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProducts = useCallback((query: string) => {
    if (!query.trim()) {
      setProducts(allProducts);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm) ||
      product.accurate_code?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.model?.toLowerCase().includes(searchTerm)
    );

    setProducts(filtered);
  }, [allProducts]);

  const filterByCategory = useCallback((category: string) => {
    if (!category || category === 'all') {
      setProducts(allProducts);
      return;
    }

    const filtered = allProducts.filter(product => product.category === category);
    setProducts(filtered);
  }, [allProducts]);

  const filterByBrand = useCallback((brand: string) => {
    if (!brand || brand === 'all') {
      setProducts(allProducts);
      return;
    }

    const filtered = allProducts.filter(product => product.brand === brand);
    setProducts(filtered);
  }, [allProducts]);

  const sortProducts = useCallback((sortBy: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc') => {
    const sorted = [...products].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    setProducts(sorted);
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    allProducts,
    categories,
    brands,
    loading,
    error,
    refetch: fetchProducts,
    searchProducts,
    filterByCategory,
    filterByBrand,
    sortProducts
  };
}; 