import { supabase } from '@/lib/supabase'
import { getAccurateAPI, AccurateProduct, AccurateSyncResult } from '@/lib/accurateAPI'

interface SyncStats {
  processed: number
  created: number
  updated: number
  failed: number
  errors: string[]
}

interface SyncLogEntry {
  sync_type: string
  status: 'success' | 'error' | 'warning'
  records_processed: number
  records_created: number
  records_updated: number
  records_failed: number
  error_message?: string
  started_at: string
  completed_at?: string
  duration_seconds?: number
}

class SyncService {
  private accurateAPI = getAccurateAPI()

  /**
   * Sync all products from Accurate to Supabase
   */
  async syncAllProducts(): Promise<AccurateSyncResult> {
    const startTime = Date.now()
    const stats: SyncStats = {
      processed: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    }

    // Log sync start
    const syncLogId = await this.logSyncStart('full_sync')

    try {
      // Authenticate with Accurate API
      const timestamp = new Date().toISOString()
      console.log('🔑 Starting Accurate authentication for full sync:', {
        timestamp,
        apiUrl: process.env.ACCURATE_API_URL,
        clientId: process.env.ACCURATE_CLIENT_ID,
        companyId: process.env.ACCURATE_COMPANY_ID,
        clientIdLength: process.env.ACCURATE_CLIENT_ID?.length || 0,
        clientSecretLength: process.env.ACCURATE_CLIENT_SECRET?.length || 0
      })

      const authenticated = await this.accurateAPI.authenticate()
      if (!authenticated) {
        const errorMsg = 'Failed to authenticate with Accurate API'
        console.error('❌ Authentication failed:', {
          timestamp,
          error: errorMsg,
          config: {
            apiUrl: process.env.ACCURATE_API_URL,
            clientIdExists: !!process.env.ACCURATE_CLIENT_ID,
            clientSecretExists: !!process.env.ACCURATE_CLIENT_SECRET,
            companyIdExists: !!process.env.ACCURATE_COMPANY_ID
          }
        })
        throw new Error(errorMsg)
      }
      
      console.log('✅ Authentication successful for full sync:', { timestamp })

      // Test connection
      console.log('🔗 Testing connection to Accurate API...', { timestamp })
      const connectionTest = await this.accurateAPI.testConnection()
      if (!connectionTest.success) {
        const errorMsg = `Connection test failed: ${connectionTest.message}`
        console.error('❌ Connection test failed:', {
          timestamp,
          error: errorMsg,
          connectionTestResult: connectionTest
        })
        throw new Error(errorMsg)
      }
      
      console.log('✅ Connection test successful:', {
        timestamp,
        connectionData: connectionTest.data
      })

      // Fetch all products from Accurate
      console.log('Fetching products from Accurate...')
      const productsResponse = await this.accurateAPI.getAllProducts()
      
      if (!productsResponse.success) {
        throw new Error(`Failed to fetch products: ${productsResponse.message}`)
      }

      const accurateProducts = productsResponse.data
      stats.processed = accurateProducts.length

      console.log(`Processing ${accurateProducts.length} products...`)

      // Sync categories first
      await this.syncCategories()

      // Process products in batches
      const batchSize = 50
      for (let i = 0; i < accurateProducts.length; i += batchSize) {
        const batch = accurateProducts.slice(i, i + batchSize)
        const batchResults = await this.processBatch(batch)
        
        stats.created += batchResults.created
        stats.updated += batchResults.updated
        stats.failed += batchResults.failed
        stats.errors.push(...batchResults.errors)

        // Add delay between batches to avoid overwhelming the database
        if (i + batchSize < accurateProducts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      const endTime = Date.now()
      const duration = Math.round((endTime - startTime) / 1000)

      // Log sync completion
      await this.logSyncComplete(syncLogId, {
        sync_type: 'full_sync',
        status: stats.failed > 0 ? 'warning' : 'success',
        records_processed: stats.processed,
        records_created: stats.created,
        records_updated: stats.updated,
        records_failed: stats.failed,
        error_message: stats.errors.length > 0 ? stats.errors.join('; ') : undefined,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        duration_seconds: duration
      })

      return {
        success: true,
        message: `Sync completed. Processed: ${stats.processed}, Created: ${stats.created}, Updated: ${stats.updated}, Failed: ${stats.failed}`,
        stats: {
          processed: stats.processed,
          created: stats.created,
          updated: stats.updated,
          failed: stats.failed
        },
        errors: stats.errors.length > 0 ? stats.errors : undefined
      }

    } catch (error: any) {
      const endTime = Date.now()
      const duration = Math.round((endTime - startTime) / 1000)

      await this.logSyncComplete(syncLogId, {
        sync_type: 'full_sync',
        status: 'error',
        records_processed: stats.processed,
        records_created: stats.created,
        records_updated: stats.updated,
        records_failed: stats.failed + 1,
        error_message: error.message,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        duration_seconds: duration
      })

      return {
        success: false,
        message: `Sync failed: ${error.message}`,
        stats: {
          processed: stats.processed,
          created: stats.created,
          updated: stats.updated,
          failed: stats.failed + 1
        },
        errors: [error.message, ...stats.errors]
      }
    }
  }

  /**
   * Sync only modified products since last sync
   */
  async syncModifiedProducts(): Promise<AccurateSyncResult> {
    const startTime = Date.now()
    const stats: SyncStats = {
      processed: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    }

    const syncLogId = await this.logSyncStart('incremental_sync')

    try {
      // Get last sync date
      const lastSync = await this.getLastSyncDate()
      const lastSyncDate = lastSync || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Default to 24 hours ago

      const timestamp = new Date().toISOString()
      console.log('🔄 Starting incremental sync:', {
        timestamp,
        lastSyncDate,
        timeSinceLastSync: lastSync ? `${Math.round((Date.now() - new Date(lastSync).getTime()) / (1000 * 60))} minutes` : 'never synced'
      })

      // Authenticate with Accurate API
      console.log('🔑 Starting Accurate authentication for incremental sync:', {
        timestamp,
        apiUrl: process.env.ACCURATE_API_URL,
        clientIdExists: !!process.env.ACCURATE_CLIENT_ID,
        clientSecretExists: !!process.env.ACCURATE_CLIENT_SECRET,
        companyIdExists: !!process.env.ACCURATE_COMPANY_ID
      })

      const authenticated = await this.accurateAPI.authenticate()
      if (!authenticated) {
        const errorMsg = 'Failed to authenticate with Accurate API for incremental sync'
        console.error('❌ Authentication failed for incremental sync:', {
          timestamp,
          error: errorMsg
        })
        throw new Error(errorMsg)
      }
      
      console.log('✅ Authentication successful for incremental sync:', { timestamp })

      // Fetch modified products
      const productsResponse = await this.accurateAPI.getModifiedProducts(lastSyncDate)
      
      if (!productsResponse.success) {
        throw new Error(`Failed to fetch modified products: ${productsResponse.message}`)
      }

      const modifiedProducts = productsResponse.data
      stats.processed = modifiedProducts.length

      if (modifiedProducts.length === 0) {
        const endTime = Date.now()
        const duration = Math.round((endTime - startTime) / 1000)

        await this.logSyncComplete(syncLogId, {
          sync_type: 'incremental_sync',
          status: 'success',
          records_processed: 0,
          records_created: 0,
          records_updated: 0,
          records_failed: 0,
          started_at: new Date(startTime).toISOString(),
          completed_at: new Date().toISOString(),
          duration_seconds: duration
        })

        return {
          success: true,
          message: 'No modified products found',
          stats: { processed: 0, created: 0, updated: 0, failed: 0 }
        }
      }

      console.log(`Processing ${modifiedProducts.length} modified products...`)

      // Process products
      const batchResults = await this.processBatch(modifiedProducts)
      stats.created = batchResults.created
      stats.updated = batchResults.updated
      stats.failed = batchResults.failed
      stats.errors = batchResults.errors

      const endTime = Date.now()
      const duration = Math.round((endTime - startTime) / 1000)

      await this.logSyncComplete(syncLogId, {
        sync_type: 'incremental_sync',
        status: stats.failed > 0 ? 'warning' : 'success',
        records_processed: stats.processed,
        records_created: stats.created,
        records_updated: stats.updated,
        records_failed: stats.failed,
        error_message: stats.errors.length > 0 ? stats.errors.join('; ') : undefined,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        duration_seconds: duration
      })

      return {
        success: true,
        message: `Incremental sync completed. Processed: ${stats.processed}, Created: ${stats.created}, Updated: ${stats.updated}, Failed: ${stats.failed}`,
        stats: {
          processed: stats.processed,
          created: stats.created,
          updated: stats.updated,
          failed: stats.failed
        },
        errors: stats.errors.length > 0 ? stats.errors : undefined
      }

    } catch (error: any) {
      const endTime = Date.now()
      const duration = Math.round((endTime - startTime) / 1000)

      await this.logSyncComplete(syncLogId, {
        sync_type: 'incremental_sync',
        status: 'error',
        records_processed: stats.processed,
        records_created: stats.created,
        records_updated: stats.updated,
        records_failed: stats.failed + 1,
        error_message: error.message,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        duration_seconds: duration
      })

      return {
        success: false,
        message: `Incremental sync failed: ${error.message}`,
        stats: {
          processed: stats.processed,
          created: stats.created,
          updated: stats.updated,
          failed: stats.failed + 1
        },
        errors: [error.message, ...stats.errors]
      }
    }
  }

  /**
   * Process a batch of products
   */
  private async processBatch(products: AccurateProduct[]): Promise<SyncStats> {
    const stats: SyncStats = {
      processed: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    }

    for (const accurateProduct of products) {
      try {
        const result = await this.syncSingleProduct(accurateProduct)
        if (result.created) {
          stats.created++
        } else if (result.updated) {
          stats.updated++
        }
        stats.processed++
      } catch (error: any) {
        console.error(`Failed to sync product ${accurateProduct.itemNo}:`, error)
        stats.failed++
        stats.errors.push(`Product ${accurateProduct.itemNo}: ${error.message}`)
      }
    }

    return stats
  }

  /**
   * Sync a single product
   */
  private async syncSingleProduct(accurateProduct: AccurateProduct): Promise<{ created: boolean; updated: boolean }> {
    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('accurate_id', accurateProduct.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Database error: ${fetchError.message}`)
    }

    // Determine category
    let categoryName = 'Uncategorized'
    if (accurateProduct.itemCategoryName) {
      categoryName = accurateProduct.itemCategoryName
    } else if (accurateProduct.brandName) {
      categoryName = accurateProduct.brandName
    }

    // Prepare product data
    const productData = {
      name: accurateProduct.name,
      description: accurateProduct.description || null,
      price: accurateProduct.unitPrice || 0,
      stock_quantity: Math.floor(accurateProduct.quantity || 0),
      category: categoryName,
      brand: accurateProduct.brandName || null,
      model: accurateProduct.itemNo || null,
      status: accurateProduct.isActive ? 'active' : 'inactive',
      accurate_id: accurateProduct.id,
      accurate_item_no: accurateProduct.itemNo,
      accurate_last_modified: accurateProduct.lastModified,
      unit_of_measure: accurateProduct.unitOfMeasure || 'pcs',
      average_cost: accurateProduct.averageCost || 0,
      is_featured: false
    }

    if (existingProduct) {
      // Update existing product
      const { error: updateError } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProduct.id)

      if (updateError) {
        throw new Error(`Update failed: ${updateError.message}`)
      }

      return { created: false, updated: true }
    } else {
      // Create new product
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`)
      }

      return { created: true, updated: false }
    }
  }

  /**
   * Sync categories from Accurate
   */
  private async syncCategories(): Promise<void> {
    try {
      const categoriesResponse = await this.accurateAPI.getProductCategories()
      
      if (categoriesResponse.success && categoriesResponse.data.length > 0) {
        for (const category of categoriesResponse.data) {
          await supabase
            .from('categories')
            .upsert({
              name: category.name,
              description: category.description || null,
              accurate_id: category.id
            }, {
              onConflict: 'accurate_id'
            })
        }
      }
    } catch (error) {
      console.error('Failed to sync categories:', error)
      // Don't throw error, categories sync is not critical
    }
  }

  /**
   * Get last sync date
   */
  private async getLastSyncDate(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('accurate_sync_logs')
        .select('completed_at')
        .eq('status', 'success')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        return null
      }

      return data.completed_at
    } catch (error) {
      return null
    }
  }

  /**
   * Log sync start
   */
  private async logSyncStart(syncType: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('accurate_sync_logs')
        .insert({
          sync_type: syncType,
          status: 'running',
          records_processed: 0,
          records_created: 0,
          records_updated: 0,
          records_failed: 0,
          started_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) {
        console.error('Failed to log sync start:', error)
        return 'unknown'
      }

      return data.id
    } catch (error) {
      console.error('Failed to log sync start:', error)
      return 'unknown'
    }
  }

  /**
   * Log sync completion
   */
  private async logSyncComplete(syncLogId: string, logData: SyncLogEntry): Promise<void> {
    try {
      const { error } = await supabase
        .from('accurate_sync_logs')
        .update(logData)
        .eq('id', syncLogId)

      if (error) {
        console.error('Failed to log sync completion:', error)
      }
    } catch (error) {
      console.error('Failed to log sync completion:', error)
    }
  }

  /**
   * Setup webhook for automatic sync
   */
  async setupWebhook(): Promise<{ success: boolean; message: string }> {
    try {
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/accurate`
      
      // Temporarily commented out - need to implement createWebhook method
      // const result = await this.accurateAPI.createWebhook(webhookUrl, [
      //   'item.created',
      //   'item.updated',
      //   'item.deleted'
      // ]);
      
      const result = null; // Placeholder

      return {
        success: result !== null,
        message: result ? result : 'Webhook setup failed'
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Webhook setup failed: ${error.message}`
      }
    }
  }

  /**
   * Test Accurate API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const timestamp = new Date().toISOString()
      console.log('🧪 Starting connection test:', {
        timestamp,
        config: {
          apiUrl: process.env.ACCURATE_API_URL,
          clientIdExists: !!process.env.ACCURATE_CLIENT_ID,
          clientSecretExists: !!process.env.ACCURATE_CLIENT_SECRET,
          companyIdExists: !!process.env.ACCURATE_COMPANY_ID,
          clientIdLength: process.env.ACCURATE_CLIENT_ID?.length || 0,
          clientSecretLength: process.env.ACCURATE_CLIENT_SECRET?.length || 0,
          companyId: process.env.ACCURATE_COMPANY_ID
        }
      })

      const authenticated = await this.accurateAPI.authenticate()
      if (!authenticated) {
        console.error('❌ Connection test - Authentication failed:', {
          timestamp,
          error: 'Authentication failed'
        })
        return {
          success: false,
          message: 'Authentication failed'
        }
      }

      console.log('✅ Connection test - Authentication successful:', { timestamp })

      const connectionTest = await this.accurateAPI.testConnection()
      
      const result = {
        success: connectionTest.success,
        message: connectionTest.message || (connectionTest.success ? 'Connection successful' : 'Connection failed')
      }

      console.log(connectionTest.success ? '✅ Connection test successful:' : '❌ Connection test failed:', {
        timestamp,
        result,
        connectionData: connectionTest.data
      })

      return result
    } catch (error: any) {
      const timestamp = new Date().toISOString()
      const result = {
        success: false,
        message: `Connection test failed: ${error.message}`
      }
      
      console.error('❌ Connection test exception:', {
        timestamp,
        error: error.message,
        stack: error.stack,
        result
      })
      
      return result
    }
  }
}

// Export singleton instance
export const syncService = new SyncService()
export type { SyncStats, SyncLogEntry } 