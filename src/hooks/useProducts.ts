import { useState, useEffect } from 'react';
import { AccurateApiService, AccurateProduct } from '@/services/accurateApi';
import { supabase } from '@/lib/supabase';

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
  created_at?: string
}

interface UseProductsOptions {
  brand?: string;
  category?: string;
  limit?: number;
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: AccurateProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseSupabaseProductsReturn {
  products: SupabaseProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<AccurateProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    brand,
    category,
    limit = 6,
    autoFetch = true
  } = options;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Starting product fetch with options:', { brand, category, limit, autoFetch });
      
      // Fetch all products without any filter by default
      const fetchedProducts = await AccurateApiService.getProducts({ 
        limit,
        ...(brand && { brand }),
        ...(category && { category })
      });
      
      console.log('✅ Successfully fetched', fetchedProducts.length, 'products from Accurate API');
      setProducts(fetchedProducts);
      
    } catch (err) {
      console.error('❌ Product fetch error details:', err);
      
      let errorMessage = 'Gagal mengambil data dari Accurate API';
      
      if (err instanceof Error) {
        const originalMessage = err.message;
        
        // Provide more specific error messages based on the error type
        if (originalMessage.includes('Failed to fetch')) {
          errorMessage = `❌ Koneksi Gagal: Tidak dapat terhubung ke server API Accurate. 
          
Kemungkinan penyebab:
• CORS (Cross-Origin) - API tidak mengizinkan akses dari domain ini
• Koneksi internet bermasalah
• Server API Accurate sedang down
• Firewall/proxy memblokir koneksi

Solusi yang telah diterapkan:
✅ Menggunakan API proxy lokal untuk menghindari CORS
✅ Error handling yang lebih baik

Error asli: ${originalMessage}`;
        } else if (originalMessage.includes('401') || originalMessage.includes('403')) {
          errorMessage = `❌ Autentikasi Gagal: Token atau signature tidak valid.
          
Kemungkinan penyebab:
• Token authorization expired
• Signature HMAC tidak sesuai
• Timestamp tidak valid
• Secret key salah

Error: ${originalMessage}`;
        } else if (originalMessage.includes('500')) {
          errorMessage = `❌ Server Error: Server API Accurate mengalami masalah internal.
          
Error: ${originalMessage}`;
        } else if (originalMessage.includes('timeout')) {
          errorMessage = `❌ Timeout: Koneksi ke API Accurate timeout.
          
Coba lagi dalam beberapa saat.
Error: ${originalMessage}`;
        } else {
          errorMessage = `❌ Error tidak dikenal: ${originalMessage}`;
        }
      } else {
        errorMessage = `❌ Error tidak dikenal: ${String(err)}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [limit, autoFetch]); // Remove brand and category from dependencies

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
}

// Hook to get all products (renamed from useSiemensProducts)
export function useAllProducts(limit: number = 6): UseProductsReturn {
  return useProducts({
    limit,
    autoFetch: true
  });
}

// Hook to get Siemens products specifically
export function useSiemensProducts(limit: number = 6): UseProductsReturn {
  const [products, setProducts] = useState<AccurateProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSiemensProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Starting Siemens product fetch with limit:', limit);
      
      // Fetch Siemens products specifically
      const fetchedProducts = await AccurateApiService.getSiemensProducts(limit);
      
      console.log('✅ Successfully fetched', fetchedProducts.length, 'Siemens products from Accurate API');
      setProducts(fetchedProducts);
      
    } catch (err) {
      console.error('❌ Siemens product fetch error details:', err);
      
      let errorMessage = 'Gagal mengambil data produk Siemens dari Accurate API';
      
      if (err instanceof Error) {
        const originalMessage = err.message;
        
        // Provide more specific error messages based on the error type
        if (originalMessage.includes('Failed to fetch')) {
          errorMessage = `❌ Koneksi Gagal: Tidak dapat terhubung ke server API Accurate untuk mengambil produk Siemens. 
          
Kemungkinan penyebab:
• CORS (Cross-Origin) - API tidak mengizinkan akses dari domain ini
• Koneksi internet bermasalah
• Server API Accurate sedang down
• Firewall/proxy memblokir koneksi

Solusi yang telah diterapkan:
✅ Menggunakan API proxy lokal untuk menghindari CORS
✅ Multiple filtering methods (server-side + client-side)
✅ Error handling yang lebih baik

Error asli: ${originalMessage}`;
        } else if (originalMessage.includes('401') || originalMessage.includes('403')) {
          errorMessage = `❌ Autentikasi Gagal: Token atau signature tidak valid untuk mengakses produk Siemens.
          
Kemungkinan penyebab:
• Token authorization expired
• Signature HMAC tidak sesuai
• Timestamp tidak valid
• Secret key salah

Error: ${originalMessage}`;
        } else if (originalMessage.includes('500')) {
          errorMessage = `❌ Server Error: Server API Accurate mengalami masalah internal saat mengambil produk Siemens.
          
Error: ${originalMessage}`;
        } else if (originalMessage.includes('timeout')) {
          errorMessage = `❌ Timeout: Koneksi ke API Accurate timeout saat mengambil produk Siemens.
          
Coba lagi dalam beberapa saat.
Error: ${originalMessage}`;
        } else {
          errorMessage = `❌ Error tidak dikenal saat mengambil produk Siemens: ${originalMessage}`;
        }
      } else {
        errorMessage = `❌ Error tidak dikenal: ${String(err)}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiemensProducts();
  }, [limit]);

  return {
    products,
    loading,
    error,
    refetch: fetchSiemensProducts
  };
}

// Hook to get Siemens products from Supabase
export function useSupabaseSiemensProducts(limit: number = 10): UseSupabaseProductsReturn {
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSiemensProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Starting Supabase product fetch with limit:', limit);
      
      // Search for Siemens products from real database
      console.log('🔍 [SUPABASE] Fetching Siemens products from database...');
      
      // Try multiple approaches to find Siemens products
      let products = null;
      let error = null;
      
      // First try: search by name containing siemens
      const { data: nameProducts, error: nameError } = await supabase
        .from('products')
        .select('*')
        .ilike('name', '%siemens%')
        .limit(30);
        
      console.log('🔍 [SUPABASE] Siemens name search results:', nameProducts?.length || 0);
      
      if (nameProducts && nameProducts.length > 0) {
        products = nameProducts;
      } else {
        // Second try: search by brand
        const { data: brandProducts, error: brandError } = await supabase
          .from('products')
          .select('*')
          .ilike('brand', '%siemens%')
          .limit(30);
          
        console.log('🔍 [SUPABASE] Siemens brand search results:', brandProducts?.length || 0);
        
        if (brandProducts && brandProducts.length > 0) {
          products = brandProducts;
        } else {
          // Third try: search in any field for siemens
          const { data: anyProducts, error: anyError } = await supabase
            .from('products')
            .select('*')
            .or(`name.ilike.%siemens%,brand.ilike.%siemens%,category.ilike.%siemens%,accurate_code.ilike.%siemens%,description.ilike.%siemens%`)
            .limit(50);
            
          console.log('🔍 [SUPABASE] Siemens any field search results:', anyProducts?.length || 0);
          products = anyProducts;
          error = anyError;
        }
      }

      console.log('🔍 [SUPABASE] Raw query result:', { 
        products, 
        error,
        count: products?.length || 0 
      });

      if (error) {
        console.error('❌ [SUPABASE] Database error:', error);
        throw error;
      }

            if (!products || products.length === 0) {
        console.log('⚠️ [SUPABASE] No Siemens products found - checking if any products exist...');
        
        // Check if there are any products at all in the database
        const { data: allProducts, error: allError } = await supabase
          .from('products')
          .select('*')
          .limit(10);
          
        if (allProducts && allProducts.length > 0) {
          console.log('🔍 [SUPABASE] Found', allProducts.length, 'total products in database');
          console.log('📋 [SUPABASE] Sample products:', allProducts.slice(0, 3).map(p => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category
          })));
          
          // Return empty array if no Siemens products found but other products exist
          setProducts([]);
        } else {
          console.log('⚠️ [SUPABASE] No products found at all in database');
          setProducts([]);
        }
        return;
      }

      // Debug: Show first few products raw data
      console.log('🔍 [SUPABASE] First 3 products raw data:', products.slice(0, 3));
      
      // Check what columns exist in the data
      const firstProduct = products[0];
      console.log('🔍 [SUPABASE] Available columns:', Object.keys(firstProduct || {}));

      // Since we already searched for Samsung products, just filter for valid data
      const validProducts = products.filter(product => {
        // Check different possible name columns
        const hasName = product.name || product.product_name || product.title || product.item_name;
        const hasValidName = hasName && String(hasName).trim() !== '' && String(hasName).toLowerCase() !== 'null';
        
        console.log(`🔍 [SUPABASE] Product ${product.id} - Name: "${hasName}", Valid: ${hasValidName}`);
        
        return hasValidName;
      });

             console.log(`🔍 [SUPABASE] Valid Siemens products after filtering: ${validProducts.length}`);

      // Map to standardized format
      const mappedProducts = validProducts.map(product => {
        // Handle different possible column names
        const productName = product.name || product.product_name || product.title || product.item_name || 'Produk Tanpa Nama';
        const productPrice = product.price || product.selling_price || product.retail_price || 0;
        const productCode = product.accurate_code || product.code || product.sku || product.product_code;
        const productCategory = product.category || product.category_name || product.group || 'Umum';
        const productBrand = product.brand || product.brand_name || product.manufacturer || 'Unknown';
        const productStock = product.stock_quantity || product.stock || product.qty || 0;
        const productImage = product.admin_thumbnail || product.image || product.thumbnail || product.photo;
        
        return {
          id: product.id,
          name: String(productName).trim(),
          description: product.description || '',
          price: Number(productPrice) || 0,
          stock_quantity: Number(productStock) || 0,
          category: String(productCategory).trim(),
          accurate_code: productCode ? String(productCode).trim() : '',
          brand: String(productBrand).trim(),
          status: product.status || 'active',
          is_published: product.is_published !== false,
          is_available_online: product.is_available_online !== false,
          admin_thumbnail: productImage || '',
          created_at: product.created_at || product.date_created || new Date().toISOString()
        };
      });

      // Sort by completeness and relevance
      const sortedProducts = mappedProducts.sort((a, b) => {
        // Prioritize products with more complete data
        const aCompleteness = (a.name ? 1 : 0) + (a.price > 0 ? 1 : 0) + (a.accurate_code ? 1 : 0) + (a.admin_thumbnail ? 1 : 0);
        const bCompleteness = (b.name ? 1 : 0) + (b.price > 0 ? 1 : 0) + (b.accurate_code ? 1 : 0) + (b.admin_thumbnail ? 1 : 0);
        
        if (aCompleteness !== bCompleteness) {
          return bCompleteness - aCompleteness;
        }
        
        // Then by price (higher first)
        if (a.price !== b.price) {
          return b.price - a.price;
        }
        
        // Finally by creation date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Take only the requested limit
      const finalProducts = sortedProducts.slice(0, limit);

             console.log(`✅ [SUPABASE] Processed ${finalProducts.length} Siemens products for display`);
       console.log('📋 [SUPABASE] Final Siemens products:', finalProducts.map(p => ({
         id: p.id,
         name: p.name,
         brand: p.brand,
         price: p.price,
         accurate_code: p.accurate_code,
         category: p.category
       })));
       
       // Double check all products are Siemens related
       finalProducts.forEach(product => {
         const isSiemens = (
           product.name?.toLowerCase().includes('siemens') ||
           product.brand?.toLowerCase().includes('siemens') ||
           product.category?.toLowerCase().includes('siemens') ||
           product.accurate_code?.toLowerCase().includes('siemens')
         );
         console.log(`🔍 [SUPABASE] Product "${product.name}" is Siemens: ${isSiemens}`);
       });
       
       setProducts(finalProducts);
      
    } catch (err) {
      console.error('❌ Supabase product fetch error details:', err);
      
      let errorMessage = 'Gagal mengambil data produk dari database';
      
      if (err instanceof Error) {
        errorMessage = `❌ Error mengambil produk: ${err.message}`;
      } else {
        errorMessage = `❌ Error tidak dikenal: ${String(err)}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiemensProducts();
  }, [limit]);

  return {
    products,
    loading,
    error,
    refetch: fetchSiemensProducts
  };
} 