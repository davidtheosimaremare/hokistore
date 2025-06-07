import { getApiHeaders } from '@/utils/crypto';

// TypeScript interfaces for Accurate API response
export interface AccurateProduct {
  id: number;
  name: string;
  no?: string; // Item number
  unitPrice: number;
  shortName?: string;
  itemTypeName?: string;
  itemCategory?: {
    name: string;
    id: number;
  };
  unit1Name?: string;
  unit1NameWarehouse?: string;
  unit2Name?: string;
  unit2NameWarehouse?: string;
  unit3Name?: string;
  unit3NameWarehouse?: string;
  unitConversion1?: number;
  unitConversion2?: number;
  unitConversion3?: number;
  availableToSell?: number;
  balance?: number; // stock
  suspended?: boolean; // isActive (inverted)
  detailWarehouseData?: Array<{
    warehouseName: string;
    balance: number;
    balanceUnit: string;
    suspended: boolean;
    defaultWarehouse: boolean;
  }>;
  detailSellingPrice?: Array<{
    price: number;
    currency: {
      symbol: string;
      code: string;
    };
    unit: {
      name: string;
    };
    effectiveDate: string;
  }>;
  detailItemImage?: Array<{
    originalName?: string;
    itemId?: number;
    path?: string | null;
    rotate?: number;
    extension?: string;
    fileName?: string;
    optLock?: number;
    thumbnailPath?: string;
    name?: string;
    id?: number;
    persistMode?: string;
    seq?: number;
    imageUrl?: string;
    imageDescription?: string;
    sequence?: number;
  }>;
  
  // Computed/derived fields for compatibility
  isActive?: boolean;
  stock?: number;
  unitName?: string;
  description?: string;
  itemType?: string;
  hasExpiry?: boolean;
  
  // Additional fields for fallback compatibility
  productType?: string;
  active?: boolean;
  category?: string;
  brand?: string;
  model?: string;
  specifications?: string;
  imageUrl?: string;
  itemNo?: string;
  barcode?: string;
  unitOfMeasure?: string;
}

export interface AccurateApiResponse {
  s: boolean; // success
  d: AccurateProduct[]; // data array
  message?: string;
  totalCount?: number;
}

export interface AccurateItemDetailResponse {
  s: boolean; // success
  d: AccurateProduct; // single data object
  message?: string;
}

export interface AccurateStockResponse {
  s: boolean; // success
  d: {
    stock: number;
    itemId: number;
  };
  message?: string;
}

// Base URL for Accurate API - use local proxy instead of direct API
const ACCURATE_API_BASE_URL = '/api/accurate';

// Fields to retrieve from Accurate API
const ITEM_FIELDS = 'id,name,unitPrice,no,availableToSell,stock,unitName,itemCategory,description,isActive,itemType,itemTypeName,shortName,hasExpiry,unit1Name,unit1NameWarehouse,unit2Name,unit2NameWarehouse,unit3Name,unit3NameWarehouse,unitConversion1,unitConversion2,unitConversion3,detailWarehouseData,detailSellingPrice,balance,suspended,detailItemImage';

/**
 * Transform Accurate API product data to our format
 */
function transformAccurateProduct(apiProduct: any): AccurateProduct {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    no: apiProduct.no,
    unitPrice: apiProduct.unitPrice || 0,
    shortName: apiProduct.shortName,
    itemTypeName: apiProduct.itemTypeName,
    itemCategory: apiProduct.itemCategory,
    unit1Name: apiProduct.unit1Name,
    unit1NameWarehouse: apiProduct.unit1NameWarehouse,
    unit2Name: apiProduct.unit2Name,
    unit2NameWarehouse: apiProduct.unit2NameWarehouse,
    unit3Name: apiProduct.unit3Name,
    unit3NameWarehouse: apiProduct.unit3NameWarehouse,
    unitConversion1: apiProduct.unitConversion1,
    unitConversion2: apiProduct.unitConversion2,
    unitConversion3: apiProduct.unitConversion3,
    availableToSell: apiProduct.availableToSell,
    balance: apiProduct.balance,
    suspended: apiProduct.suspended,
    detailWarehouseData: apiProduct.detailWarehouseData,
    detailSellingPrice: apiProduct.detailSellingPrice,
    detailItemImage: apiProduct.detailItemImage,
    
    // Computed fields
    isActive: !apiProduct.suspended,
    stock: apiProduct.balance || apiProduct.availableToSell || 0,
    unitName: apiProduct.unit1Name,
    description: apiProduct.description || `${apiProduct.itemTypeName} - ${apiProduct.shortName}`,
    itemType: apiProduct.itemType,
    hasExpiry: apiProduct.hasExpiry,
    
    // Image will be managed from admin panel, use placeholder for now
    imageUrl: undefined,
    
    // Compatibility fields
    productType: apiProduct.itemTypeName,
    active: !apiProduct.suspended,
    category: apiProduct.itemCategory?.name,
    unitOfMeasure: apiProduct.unit1Name,
    itemNo: apiProduct.no,
  };
}

export class AccurateApiService {
  
  /**
   * Fetch products from Accurate API using /api/item/list.do
   * @param filters Object containing filter parameters
   * @returns Promise<AccurateProduct[]>
   */
  static async getProducts(filters: {
    brand?: string;
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<AccurateProduct[]> {
    
    // Build query parameters for proxy API
    const queryParams = new URLSearchParams();
    
    // Add endpoint parameter
    queryParams.append('endpoint', 'item/list.do');
    
    // Add fields parameter
    queryParams.append('fields', ITEM_FIELDS);
    
    // Add pagination and filtering
    const pageSize = filters.limit || 50; // Default to 50, allow override
    const page = filters.offset ? Math.floor(filters.offset / pageSize) : 0;
    
    queryParams.append('sp.pageSize', pageSize.toString());
    queryParams.append('sp.page', page.toString());
    
    if (filters.brand) queryParams.append('sp.filter', `name LIKE '%${filters.brand}%'`);
    if (filters.category) queryParams.append('sp.filter', `itemCategory.name LIKE '%${filters.category}%'`);
    
    const url = `${ACCURATE_API_BASE_URL}?${queryParams.toString()}`;
    
    console.log('🔗 Fetching from proxy URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      // Headers will be handled by the proxy
    });
    
    console.log('📥 Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Proxy Response Error:', response.status, response.statusText, errorData);
      
      const errorMessage = errorData.error || `API request failed: ${response.status} ${response.statusText}`;
      const errorDetails = errorData.details ? ` - ${errorData.details}` : '';
      
      throw new Error(`${errorMessage}${errorDetails}`);
    }
    
    const data: AccurateApiResponse = await response.json();
    console.log('📊 Raw API Response via proxy:', data);
    
    if (!data.s) {
      console.error('❌ API returned error:', data.message);
      throw new Error(data.message || 'Accurate API request was not successful');
    }
    
    // Transform API data to our format
    const transformedProducts = (data.d || []).map(transformAccurateProduct);
    console.log('✅ Transformed products:', transformedProducts.length, 'items');
    console.log('🔍 First product sample:', transformedProducts[0]);
    
    return transformedProducts;
  }
  
  /**
   * Get product detail from Accurate API using /api/item/detail.do
   * @param itemId Product ID
   * @returns Promise<AccurateProduct | null>
   */
  static async getProductDetail(itemId: number): Promise<AccurateProduct | null> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('endpoint', 'item/detail.do');
      queryParams.append('id', itemId.toString());
      queryParams.append('fields', ITEM_FIELDS);
      
      const url = `${ACCURATE_API_BASE_URL}?${queryParams.toString()}`;
      
      console.log('Fetching product detail from proxy URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data: AccurateItemDetailResponse = await response.json();
      console.log('Product detail API Response via proxy:', data);
      
      if (!data.s) {
        throw new Error(data.message || 'API request was not successful');
      }
      
      return data.d ? transformAccurateProduct(data.d) : null;
      
    } catch (error) {
      console.error('Error fetching product detail from Accurate API:', error);
      return null;
    }
  }
  
  /**
   * Get product stock from Accurate API using /api/item/get-stock.do
   * @param itemId Product ID
   * @returns Promise<number>
   */
  static async getProductStock(itemId: number): Promise<number> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('endpoint', 'item/get-stock.do');
      queryParams.append('itemId', itemId.toString());
      
      const url = `${ACCURATE_API_BASE_URL}?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data: AccurateStockResponse = await response.json();
      
      if (!data.s) {
        throw new Error(data.message || 'API request was not successful');
      }
      
      return data.d?.stock || 0;
      
    } catch (error) {
      console.error('Error fetching product stock from Accurate API:', error);
      return 0;
    }
  }
  
  /**
   * Search products by item name or serial number using /api/item/search-by-item-or-sn.do
   * @param query Search query
   * @returns Promise<AccurateProduct[]>
   */
  static async searchProducts(query: string): Promise<AccurateProduct[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('endpoint', 'item/search-by-item-or-sn.do');
      queryParams.append('itemName', query);
      queryParams.append('fields', ITEM_FIELDS);
      
      const url = `${ACCURATE_API_BASE_URL}?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data: AccurateApiResponse = await response.json();
      
      if (!data.s) {
        throw new Error(data.message || 'API request was not successful');
      }
      
      return (data.d || []).map(transformAccurateProduct);
      
    } catch (error) {
      console.error('Error searching products from Accurate API:', error);
      return [];
    }
  }
  
  /**
   * Get all products without any specific filtering
   * @param limit Number of products to return (default: 6)
   * @returns Promise<AccurateProduct[]>
   */
  static async getAllProducts(limit: number = 6): Promise<AccurateProduct[]> {
    console.log('🔍 Fetching all products from Accurate API, limit:', limit);
    
    const allProducts = await this.getProducts({ limit });
    console.log('📦 Got', allProducts.length, 'total products from API');
    
    return allProducts.slice(0, limit);
  }
  
  /**
   * Get products filtered by specific criteria
   * @param limit Number of products to return (default: 6)
   * @param filters Optional filters (brand, category)
   * @returns Promise<AccurateProduct[]>
   */
  static async getFilteredProducts(limit: number = 6, filters: { brand?: string; category?: string; } = {}): Promise<AccurateProduct[]> {
    console.log('🔍 Fetching filtered products from Accurate API, limit:', limit, 'filters:', filters);
    
    const products = await this.getProducts({
      ...filters,
      limit: limit
    });
    
    console.log('📦 Got', products.length, 'filtered products from API');
    return products.slice(0, limit);
  }

  /**
   * Get Siemens products specifically
   * @param limit Number of products to return (default: 6)
   * @returns Promise<AccurateProduct[]>
   */
  static async getSiemensProducts(limit: number = 6): Promise<AccurateProduct[]> {
    console.log('🔍 Fetching Siemens products from Accurate API, limit:', limit);
    
    try {
      // First try to get products with Siemens filter via API
      let siemensProducts: AccurateProduct[] = [];
      
      // Method 1: Try server-side filtering
      try {
        siemensProducts = await this.getProducts({ 
          brand: 'Siemens',
          limit: limit * 2 // Get more to account for filtering
        });
        console.log('📦 Got', siemensProducts.length, 'products with Siemens brand filter');
      } catch (error) {
        console.log('⚠️ Brand filter failed, trying name filter:', error);
        
        // Method 2: Try name-based filtering via API
        try {
          const queryParams = new URLSearchParams();
          queryParams.append('endpoint', 'item/list.do');
          queryParams.append('fields', ITEM_FIELDS);
          queryParams.append('sp.pageSize', (limit * 3).toString()); // Get more for better filtering
          queryParams.append('sp.page', '0');
          queryParams.append('sp.filter', `name LIKE '%Siemens%'`);
          
          const url = `${ACCURATE_API_BASE_URL}?${queryParams.toString()}`;
          console.log('🔗 Trying name filter URL:', url);
          
          const response = await fetch(url, { method: 'GET' });
          
          if (response.ok) {
            const data: AccurateApiResponse = await response.json();
            if (data.s && data.d) {
              siemensProducts = data.d.map(transformAccurateProduct);
              console.log('📦 Got', siemensProducts.length, 'products with name filter');
            }
          }
        } catch (nameFilterError) {
          console.log('⚠️ Name filter also failed:', nameFilterError);
        }
      }
      
      // Method 3: If API filtering doesn't work, get all products and filter client-side
      if (siemensProducts.length === 0) {
        console.log('🔄 Falling back to client-side filtering...');
        const allProducts = await this.getProducts({ limit: 200 }); // Get more products for filtering
        
        siemensProducts = allProducts.filter(product => 
          product.name?.toLowerCase().includes('siemens') ||
          product.shortName?.toLowerCase().includes('siemens') ||
          product.description?.toLowerCase().includes('siemens') ||
          product.brand?.toLowerCase().includes('siemens') ||
          product.itemCategory?.name?.toLowerCase().includes('siemens')
        );
        
        console.log('📦 Client-side filter found', siemensProducts.length, 'Siemens products');
      }
      
      // Sort by name and take the requested limit
      const sortedSiemensProducts = siemensProducts
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, limit);
      
      console.log('✅ Returning', sortedSiemensProducts.length, 'Siemens products');
      console.log('🔍 Sample products:', sortedSiemensProducts.slice(0, 2).map(p => ({ id: p.id, name: p.name })));
      
      return sortedSiemensProducts;
      
    } catch (error) {
      console.error('❌ Error fetching Siemens products:', error);
      // Return empty array on error rather than throwing
      return [];
    }
  }

  /**
   * Get ALL products from Accurate API using pagination
   * This method fetches all available products (8000+) by paginating through all data
   * @returns Promise<AccurateProduct[]>
   */
  static async getAllProductsPaginated(): Promise<AccurateProduct[]> {
    try {
      console.log('🔄 Starting to fetch ALL products from Accurate API...');
      
      const allProducts: AccurateProduct[] = [];
      let page = 0;
      const pageSize = 200; // Increased batch size for faster loading
      let hasMoreData = true;
      let totalFetched = 0;
      let consecutiveEmptyPages = 0;

      while (hasMoreData) {
        try {
          console.log(`📄 Fetching page ${page + 1} (offset: ${page * pageSize})...`);
          
          const products = await this.getProducts({ 
            limit: pageSize,
            offset: page * pageSize
          });

          if (products.length > 0) {
            allProducts.push(...products);
            totalFetched += products.length;
            page++;
            consecutiveEmptyPages = 0;
            
            console.log(`✅ Page ${page} fetched: ${products.length} products (Total: ${totalFetched})`);
            
            if (products.length < pageSize) {
              console.log(`⚠️ Page ${page} returned ${products.length} products (less than ${pageSize}). Checking for more data...`);
            }
          } else {
            consecutiveEmptyPages++;
            console.log(`❌ Page ${page + 1} returned no products (consecutive empty: ${consecutiveEmptyPages})`);
            
            if (consecutiveEmptyPages >= 2) {
              hasMoreData = false;
              console.log('🏁 Two consecutive empty pages detected - stopping pagination');
            } else {
              page++;
            }
          }

          // Safety break - increased limit for 8000+ products
          if (page > 50) { // Allow up to 10,000 products (50 pages × 200 items)
            console.warn('⚠️ Reached maximum pagination limit (50 pages) for safety');
            hasMoreData = false;
          }
          
          // No delay for maximum speed
          
        } catch (error) {
          console.error(`❌ Error fetching page ${page + 1}:`, error);
          
          if (page < 3) {
            console.log('🔄 Retrying after error...');
            await new Promise(resolve => setTimeout(resolve, 500)); // Minimal delay only for retries
            continue;
          } else {
            console.log(`⚠️ Skipping page ${page + 1} due to error, continuing...`);
            page++;
            consecutiveEmptyPages++;
            
            if (consecutiveEmptyPages >= 3) {
              hasMoreData = false;
            }
          }
        }
      }

      console.log(`🎉 Successfully fetched ${allProducts.length} total products from Accurate API`);
      
      // Remove duplicates efficiently
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );
      
      if (uniqueProducts.length !== allProducts.length) {
        console.log(`🔧 Removed ${allProducts.length - uniqueProducts.length} duplicate products`);
      }
      
      console.log(`✨ Final result: ${uniqueProducts.length} unique products ready for display`);
      return uniqueProducts;
      
    } catch (error) {
      console.error('❌ Critical error in getAllProductsPaginated:', error);
      
      try {
        console.log('🔄 Falling back to regular getProducts with high limit...');
        return await this.getProducts({ limit: 2000 }); // Increased fallback limit
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Comprehensive search products across multiple fields - fetches all available data
   * Now uses getAllProductsPaginated for empty queries
   * @param query Search query
   * @returns Promise<AccurateProduct[]>
   */
  static async searchProductsComprehensive(query: string): Promise<AccurateProduct[]> {
    try {
      // If no query provided, return all products using pagination
      if (!query.trim()) {
        console.log('📋 No search query provided - fetching ALL products from Accurate API');
        return await this.getAllProductsPaginated();
      }

      console.log('🔍 Starting comprehensive search for:', query);

      // Function to fetch all pages for a specific filter
      const fetchAllPages = async (filters: { brand?: string; category?: string }) => {
        const allResults: AccurateProduct[] = [];
        let page = 0;
        const pageSize = 100; // Use larger page size
        let hasMoreData = true;

        while (hasMoreData) {
          try {
            const results = await this.getProducts({ 
              ...filters, 
              limit: pageSize,
              offset: page * pageSize
            });

            if (results.length > 0) {
              allResults.push(...results);
              page++;
              
              // If we got less than pageSize, we've reached the end
              if (results.length < pageSize) {
                hasMoreData = false;
              }
            } else {
              hasMoreData = false;
            }

            // Safety break to prevent infinite loops
            if (page > 50) { // Max 5000 products per search type
              console.warn('⚠️ Reached maximum pagination limit for safety');
              hasMoreData = false;
            }
          } catch (error) {
            console.error('Error fetching page', page, ':', error);
            hasMoreData = false;
          }
        }

        console.log(`📦 Fetched ${allResults.length} products with filters:`, filters);
        return allResults;
      };

      // Search with multiple approaches to get comprehensive results
      const searchPromises = [];

      // 1. Search by name using getProducts brand filter (name LIKE) - fetch all pages
      searchPromises.push(
        fetchAllPages({ brand: query }).catch(() => [])
      );

      // 2. Search by category - fetch all pages
      searchPromises.push(
        fetchAllPages({ category: query }).catch(() => [])
      );

      // 3. If query is numeric, try to search by ID
      if (!isNaN(Number(query))) {
        searchPromises.push(
          this.getProductDetail(Number(query))
            .then(product => product ? [product] : [])
            .catch(() => [])
        );
      }

      // 4. Use the dedicated search method as fallback
      searchPromises.push(
        this.searchProducts(query).catch(() => [])
      );

      // 5. Get a large sample of all products for additional client-side filtering
      searchPromises.push(
        fetchAllPages({}).then(allProducts => {
          // Client-side filter for comprehensive matching
          return allProducts.filter(product => {
            const searchLower = query.toLowerCase();
            return (
              product.name?.toLowerCase().includes(searchLower) ||
              product.shortName?.toLowerCase().includes(searchLower) ||
              product.no?.toLowerCase().includes(searchLower) ||
              product.id?.toString().includes(query) ||
              product.itemTypeName?.toLowerCase().includes(searchLower) ||
              product.itemCategory?.name?.toLowerCase().includes(searchLower) ||
              product.brand?.toLowerCase().includes(searchLower) ||
              product.category?.toLowerCase().includes(searchLower) ||
              product.model?.toLowerCase().includes(searchLower) ||
              product.barcode?.toLowerCase().includes(searchLower) ||
              product.itemNo?.toLowerCase().includes(searchLower)
            );
          });
        }).catch(() => [])
      );

      // Execute all searches in parallel
      console.log('⏱️ Executing parallel searches...');
      const results = await Promise.all(searchPromises);
      
      // Flatten and deduplicate results
      const allProducts = results.flat();
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );

      console.log(`✅ Found ${uniqueProducts.length} unique products`);

      // Additional client-side filtering for more comprehensive search
      const filteredProducts = uniqueProducts.filter(product => {
        const searchLower = query.toLowerCase();
        
        // Check various fields
        return (
          product.name?.toLowerCase().includes(searchLower) ||
          product.shortName?.toLowerCase().includes(searchLower) ||
          product.no?.toLowerCase().includes(searchLower) ||
          product.id?.toString().includes(query) ||
          product.itemTypeName?.toLowerCase().includes(searchLower) ||
          product.itemCategory?.name?.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower) ||
          product.category?.toLowerCase().includes(searchLower) ||
          product.model?.toLowerCase().includes(searchLower) ||
          product.barcode?.toLowerCase().includes(searchLower) ||
          product.itemNo?.toLowerCase().includes(searchLower)
        );
      });

      // Sort by relevance (exact matches first, then partial matches)
      filteredProducts.sort((a, b) => {
        const searchLower = query.toLowerCase();
        
        // Exact name match gets highest priority
        if (a.name?.toLowerCase() === searchLower) return -1;
        if (b.name?.toLowerCase() === searchLower) return 1;
        
        // Name starts with query gets next priority
        if (a.name?.toLowerCase().startsWith(searchLower)) return -1;
        if (b.name?.toLowerCase().startsWith(searchLower)) return 1;
        
        // ID match gets high priority
        if (a.id?.toString() === query) return -1;
        if (b.id?.toString() === query) return 1;
        
        // Alphabetical by name as final sort
        return (a.name || '').localeCompare(b.name || '');
      });

      const finalResults = filteredProducts.slice(0, 50); // Show top 50 most relevant results
      console.log(`🎯 Returning ${finalResults.length} most relevant results`);
      
      return finalResults;
      
    } catch (error) {
      console.error('Error in comprehensive search:', error);
      return [];
    }
  }
} 