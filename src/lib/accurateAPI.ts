import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { createAccurateHeaders, validateBearerToken } from '@/lib/utils/crypto'

interface AccurateConfig {
  baseURL: string
  bearerToken: string
  secretKey?: string
  companyId: string
}

interface AccurateProduct {
  id: string
  itemNo: string
  name: string
  description?: string
  unitPrice: number
  averageCost: number
  quantity: number
  unitOfMeasure: string
  itemCategoryId?: string
  itemCategoryName?: string
  brandId?: string
  brandName?: string
  supplier?: {
    id: string
    name: string
  }
  isActive: boolean
  lastModified: string
  createdDate: string
}

interface AccurateResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface AccurateSyncResult {
  success: boolean
  message: string
  stats: {
    processed: number
    created: number
    updated: number
    failed: number
  }
  errors?: string[]
}

class AccurateAPI {
  private client: AxiosInstance
  private config: AccurateConfig

  constructor(config: AccurateConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Request interceptor for Zeus Accurate authentication
    this.client.interceptors.request.use(
      (config) => {
        const timestamp = new Date().toISOString()
        
        try {
          if (this.config.bearerToken) {
            // Generate headers dengan timestamp dan signature
            const accurateHeaders = createAccurateHeaders(
              this.config.bearerToken, 
              this.config.secretKey
            )
            
            // Merge headers
            Object.assign(config.headers || {}, accurateHeaders)
            
            console.log('📤 [ZEUS-ACCURATE] Request with signature auth:', {
              timestamp,
              method: config.method?.toUpperCase(),
              url: config.url,
              bearerTokenLength: this.config.bearerToken.length,
              bearerTokenPreview: `${this.config.bearerToken.substring(0, 20)}...`,
              timestampHeader: accurateHeaders['X-Api-Timestamp'],
              signaturePreview: `${accurateHeaders['X-Api-Signature'].substring(0, 10)}...`
            })
          } else {
            console.warn('⚠️ [ZEUS-ACCURATE] No bearer token available:', {
              timestamp,
              method: config.method?.toUpperCase(),
              url: config.url
            })
          }
        } catch (error) {
          console.error('❌ [ZEUS-ACCURATE] Error generating headers:', {
            timestamp,
            error: error instanceof Error ? error.message : 'Unknown'
          })
        }
        
        return config
      },
      (error) => {
        console.error('❌ [ZEUS-ACCURATE] Request interceptor error:', {
          timestamp: new Date().toISOString(),
          error: error.message
        })
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ [ZEUS-ACCURATE] Response received:', {
          timestamp: new Date().toISOString(),
          status: response.status,
          url: response.config.url,
          dataSize: JSON.stringify(response.data).length
        })
        return response
      },
      (error) => {
        console.error('❌ [ZEUS-ACCURATE] Response error:', {
          timestamp: new Date().toISOString(),
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          message: error.message,
          responseData: error.response?.data
        })
        
        if (error.response?.status === 401) {
          console.error('❌ [ZEUS-ACCURATE] Authentication failed - check bearer token')
        }
        
        return Promise.reject(error)
      }
    )
  }

  /**
   * Validate Zeus Accurate bearer token and test connection
   */
  async authenticate(): Promise<boolean> {
    try {
      const timestamp = new Date().toISOString()
      
      console.log('🔐 [ZEUS-ACCURATE] Validating bearer token:', {
        timestamp,
        baseURL: this.config.baseURL,
        bearerTokenLength: this.config.bearerToken.length,
        bearerTokenPreview: `${this.config.bearerToken.substring(0, 20)}...`,
        secretKeyExists: !!this.config.secretKey,
        companyId: this.config.companyId
      })

      // Validate token format
      if (!validateBearerToken(this.config.bearerToken)) {
        console.error('❌ [ZEUS-ACCURATE] Invalid bearer token format')
        return false
      }

      // Test connection with session info endpoint
      const testResult = await this.testConnection()
      
      if (testResult.success) {
        console.log('✅ [ZEUS-ACCURATE] Authentication successful:', {
          timestamp,
          companyData: testResult.data
        })
        return true
      } else {
        console.error('❌ [ZEUS-ACCURATE] Authentication failed:', testResult.message)
        return false
      }
      
    } catch (error: any) {
      const timestamp = new Date().toISOString()
      console.error('❌ [ZEUS-ACCURATE] Authentication error:', {
        timestamp,
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      })
      return false
    }
  }

  /**
   * Test connection to Zeus Accurate API
   */
  async testConnection(): Promise<AccurateResponse<any>> {
    try {
      const timestamp = new Date().toISOString()
      
      console.log('🔍 [ZEUS-ACCURATE] Testing connection:', {
        timestamp,
        endpoint: '/session/info.do',
        companyId: this.config.companyId
      })

      const response: AxiosResponse = await this.client.get('/session/info.do')

      console.log('✅ [ZEUS-ACCURATE] Connection test successful:', {
        timestamp,
        status: response.status,
        sessionInfo: response.data,
        hasSuccess: response.data?.s
      })

      // Check if we get a successful API response
      if (response.data && response.data.s) {
        return {
          success: true,
          data: response.data,
          message: 'Connection successful'
        }
      } else {
        // If we get HTML or unsuccessful response, treat as auth failure
        return {
          success: false,
          data: null,
          message: 'Authentication failed - received login page instead of API response'
        }
      }
    } catch (error: any) {
      const timestamp = new Date().toISOString()
      console.error('❌ [ZEUS-ACCURATE] Connection test failed:', {
        timestamp,
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      })
      
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Connection failed'
      }
    }
  }

  /**
   * Get all products with pagination from Zeus Accurate
   */
  async getProducts(page: number = 1, limit: number = 100): Promise<AccurateResponse<AccurateProduct[]>> {
    try {
      const timestamp = new Date().toISOString()
      const requestParams = {
        'sp.page': page - 1, // Accurate API uses 0-based pagination
        'sp.pageSize': limit,
        'fields': 'id,itemNo,name,description,unitPrice,averageCost,quantity,unitOfMeasure,itemCategoryId,itemCategoryName,brandId,brandName,isActive,lastModified,createdDate'
      }

      console.log('📦 [ZEUS-ACCURATE] Fetching products:', {
        timestamp,
        endpoint: '/item/list.do',
        params: requestParams,
        bearerTokenExists: !!this.config.bearerToken,
        companyId: this.config.companyId
      })

      const response: AxiosResponse = await this.client.get('/item/list.do', {
        params: requestParams
      })

      console.log('✅ [ZEUS-ACCURATE] Products fetch successful:', {
        timestamp,
        statusCode: response.status,
        dataCount: response.data.d?.length || 0,
        totalCount: response.data.totalCount || 0,
        hasSuccess: response.data.s,
        response: response.data
      })

      // Check if API response is successful
      if (!response.data.s) {
        throw new Error(response.data.message || 'API returned unsuccessful response')
      }

      return {
        success: true,
        data: response.data.d || [],
        pagination: {
          page,
          limit,
          total: response.data.totalCount || 0,
          totalPages: Math.ceil((response.data.totalCount || 0) / limit)
        }
      }
    } catch (error: any) {
      const timestamp = new Date().toISOString()
      console.error('❌ [ZEUS-ACCURATE] Failed to fetch products:', {
        timestamp,
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestConfig: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
          bearerToken: this.config.bearerToken ? `${this.config.bearerToken.substring(0, 10)}...` : 'not set',
          companyId: this.config.companyId
        }
      })
      
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || error.message || 'Failed to fetch products'
      }
    }
  }

  /**
   * Get all products (auto-paginate)
   */
  async getAllProducts(): Promise<AccurateResponse<AccurateProduct[]>> {
    try {
      let allProducts: AccurateProduct[] = []
      let page = 1
      let hasMore = true
      const limit = 100

      console.log('🔄 [ZEUS-ACCURATE] Starting full product fetch...')

      while (hasMore) {
        const response = await this.getProducts(page, limit)
        
        if (!response.success) {
          return response
        }

        allProducts = [...allProducts, ...response.data]
        
        // Check if there are more pages
        if (response.pagination) {
          hasMore = page < response.pagination.totalPages
          page++
        } else {
          hasMore = false
        }

        console.log(`📄 [ZEUS-ACCURATE] Fetched page ${page - 1}, total products: ${allProducts.length}`)

        // Add delay to avoid rate limiting
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      console.log('✅ [ZEUS-ACCURATE] All products fetched:', {
        totalProducts: allProducts.length,
        pages: page - 1
      })

      return {
        success: true,
        data: allProducts,
        message: `Successfully fetched ${allProducts.length} products`
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to fetch all products'
      }
    }
  }

  /**
   * Get products modified after specific date
   */
  async getModifiedProducts(lastSyncDate: string): Promise<AccurateResponse<AccurateProduct[]>> {
    try {
      const response: AxiosResponse = await this.client.get('/item/list.do', {
        params: {
          'sp.filter': `lastModified>='${lastSyncDate}'`,
          'fields': 'id,itemNo,name,description,unitPrice,averageCost,quantity,unitOfMeasure,itemCategoryId,itemCategoryName,brandId,brandName,isActive,lastModified,createdDate'
        }
      })

      // Check if API response is successful
      if (!response.data.s) {
        throw new Error(response.data.message || 'API returned unsuccessful response')
      }

      return {
        success: true,
        data: response.data.d || [],
        message: `Found ${response.data.d?.length || 0} modified products since ${lastSyncDate}`
      }
    } catch (error: any) {
      console.error('❌ [ZEUS-ACCURATE] Failed to fetch modified products:', error)
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || error.message || 'Failed to fetch modified products'
      }
    }
  }

  /**
   * Get product categories
   */
  async getProductCategories(): Promise<AccurateResponse<any[]>> {
    try {
      const response: AxiosResponse = await this.client.get('/api/item-category/list.do', {
        params: {
          fields: 'id,name,description'
        }
      })

      return {
        success: true,
        data: response.data.d || [],
        message: 'Categories fetched successfully'
      }
    } catch (error: any) {
      console.error('❌ [ZEUS-ACCURATE] Failed to fetch categories:', error)
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || error.message || 'Failed to fetch categories'
      }
    }
  }
}

// Create singleton instance
let accurateAPI: AccurateAPI | null = null

export function getAccurateAPI(): AccurateAPI {
  if (!accurateAPI) {
    const config: AccurateConfig = {
      baseURL: process.env.ACCURATE_API_URL || 'https://zeus.accurate.id/accurate/api',
      bearerToken: process.env.ACCURATE_BEARER_TOKEN || 'aat.NTA.eyJ2IjoxLCJ1Ijo1NDk3NjksImQiOjk3NjgxNywiYWkiOjU1NjA5LCJhayI6IjIyYzMxYzc1LTNhZjctNGRmZS04NzcwLTNiOWExMmNjMzAwYSIsImFuIjoiV2ViIEFwaSIsImFwIjoiYTNkYmJmY2MtMmU2Ny00YjQ5LTljNDQtNjNjZTlkNjk3ODllIiwidCI6MTc0NzIxOTgyNDI2M30.10JQiTa7Q3cwGX05diQxsXpOwL/NEe4zFfuStrupwrG5a+vbUhh79qIEh+yMct9YG0qtsLt8E6aMzcP62qBTMTiQjzvpAM8qXxFsvbhw6KZSVm9ToIvWF6a4xxI6/ZwqahtuKYyTG9/siqVc6xQlkCvd8Kb0Aawf0R+3qbWWM3gpt7lsM35lQRefpWmD1jqKqpPFeaFOcXIkJJYfVh9L/w==.YfeJD4hHsaPidTOmY40RwuADLVSauKlIVSlpf3teZDg',
      secretKey: process.env.ACCURATE_SECRET_KEY || 'hokiindo2024',
      companyId: process.env.ACCURATE_COMPANY_ID || '976817'
    }

    console.log('🏗️ [ZEUS-ACCURATE] Creating API instance:', {
      baseURL: config.baseURL,
      bearerTokenExists: !!config.bearerToken,
      bearerTokenLength: config.bearerToken.length,
      secretKeyExists: !!config.secretKey,
      companyId: config.companyId
    })

    accurateAPI = new AccurateAPI(config)
  }
  
  return accurateAPI
}

export type { AccurateProduct, AccurateResponse, AccurateSyncResult } 