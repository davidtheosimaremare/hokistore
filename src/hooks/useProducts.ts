import { useState, useEffect } from 'react';
import { AccurateApiService, AccurateProduct } from '@/services/accurateApi';

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