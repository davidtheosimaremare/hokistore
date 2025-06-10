import { NextRequest, NextResponse } from 'next/server'
import { getAccurateAPI } from '@/lib/accurateAPI'
import { supabase } from '@/lib/supabase'

/**
 * Sync products from Zeus Accurate to Supabase
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'sync'
  
  try {
    const accurateAPI = getAccurateAPI()
    const timestamp = new Date().toISOString()
    
    console.log('🚀 [ZEUS-SYNC] Starting Accurate sync:', {
      timestamp,
      action,
      userAgent: request.headers.get('user-agent'),
      origin: request.headers.get('origin')
    })

    switch (action) {
      case 'test-connection':
        return await handleTestConnection(accurateAPI)
      
      case 'sync':
        return await handleProductSync(accurateAPI)
      
      case 'full-sync':
        return await handleFullSync(accurateAPI)
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: test-connection, sync, or full-sync'
        }, { status: 400 })
    }
    
  } catch (error: any) {
    console.error('❌ [ZEUS-SYNC] API error:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    })
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * Test connection to Zeus Accurate
 */
async function handleTestConnection(accurateAPI: any) {
  try {
    console.log('🔍 [ZEUS-SYNC] Testing connection...')
    
    // Test authentication
    const authResult = await accurateAPI.authenticate()
    if (!authResult) {
      return NextResponse.json({
        success: false,
        message: 'Authentication failed - check bearer token',
        error: 'Authentication failed'
      }, { status: 401 })
    }
    
    // Test connection
    const connectionResult = await accurateAPI.testConnection()
    if (!connectionResult.success) {
      return NextResponse.json({
        success: false,
        message: connectionResult.message || 'Connection test failed',
        error: connectionResult.message
      }, { status: 500 })
    }
    
    // Test product fetch
    const productsResult = await accurateAPI.getProducts(1, 5)
    
    console.log('✅ [ZEUS-SYNC] Connection test successful:', {
      authSuccess: authResult,
      connectionData: connectionResult.data,
      sampleProductsCount: productsResult.data?.length || 0
    })
    
    return NextResponse.json({
      success: true,
      message: `✅ Koneksi berhasil! ${productsResult.data?.length || 0} produk sample tersedia`,
      connection: {
        status: 'connected',
        sessionInfo: connectionResult.data,
        sampleProducts: productsResult.data?.length || 0
      },
      count: productsResult.pagination?.total || 0
    })
    
  } catch (error: any) {
    console.error('❌ [ZEUS-SYNC] Connection test failed:', error)
    
    return NextResponse.json({
      success: false,
      message: `❌ ${error.message}`,
      error: error.message
    }, { status: 500 })
  }
}

/**
 * Sync products from Zeus Accurate to Supabase
 */
async function handleProductSync(accurateAPI: any) {
  try {
    console.log('🔄 [ZEUS-SYNC] Starting product sync...')
    
    // Get last sync timestamp
    const { data: lastSync } = await supabase
      .from('accurate_sync_logs')
      .select('*')
      .eq('sync_type', 'products')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    let productsResult
    if (lastSync) {
      console.log('📅 [ZEUS-SYNC] Incremental sync since:', lastSync.created_at)
      productsResult = await accurateAPI.getModifiedProducts(lastSync.created_at)
    } else {
      console.log('📦 [ZEUS-SYNC] Full sync - no previous sync found')
      productsResult = await accurateAPI.getAllProducts()
    }
    
    if (!productsResult.success) {
      throw new Error(productsResult.error || 'Failed to fetch products from Accurate')
    }
    
    const products = productsResult.data || []
    console.log(`📊 [ZEUS-SYNC] Fetched ${products.length} products from Accurate`)
    
    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No products to sync',
        stats: { processed: 0, created: 0, updated: 0, failed: 0 }
      })
    }
    
    // Sync to Supabase
    const syncResult = await syncProductsToSupabase(products)
    
    // Log sync result
    await supabase.from('accurate_sync_logs').insert({
      sync_type: 'products',
      status: 'completed',
      records_processed: syncResult.stats.processed,
      records_created: syncResult.stats.created,
      records_updated: syncResult.stats.updated,
      records_failed: syncResult.stats.failed,
      details: {
        accurateResponse: {
          total: products.length,
          pagination: productsResult.pagination
        },
        supabaseSync: syncResult.stats,
        errors: syncResult.errors || []
      }
    })
    
    console.log('✅ [ZEUS-SYNC] Sync completed:', syncResult.stats)
    
    return NextResponse.json({
      success: true,
      message: `Sync completed: ${syncResult.stats.processed} processed, ${syncResult.stats.created} created, ${syncResult.stats.updated} updated`,
      stats: syncResult.stats,
      errors: syncResult.errors
    })
    
  } catch (error: any) {
    console.error('❌ [ZEUS-SYNC] Sync failed:', error)
    
    // Log failed sync
    await supabase.from('accurate_sync_logs').insert({
      sync_type: 'products',
      status: 'failed',
      records_processed: 0,
      records_created: 0,
      records_updated: 0,
      records_failed: 0,
      details: {
        error: error.message,
        stack: error.stack
      }
    })
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Sync failed'
    }, { status: 500 })
  }
}

/**
 * Full sync all products from Zeus Accurate
 */
async function handleFullSync(accurateAPI: any) {
  try {
    console.log('🔄 [ZEUS-SYNC] Starting FULL product sync...')
    
    // Get all products
    const productsResult = await accurateAPI.getAllProducts()
    
    if (!productsResult.success) {
      throw new Error(productsResult.error || 'Failed to fetch all products from Accurate')
    }
    
    const products = productsResult.data || []
    console.log(`📊 [ZEUS-SYNC] Fetched ${products.length} products for full sync`)
    
    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No products found in Accurate',
        stats: { processed: 0, created: 0, updated: 0, failed: 0 }
      })
    }
    
    // Clear existing products and sync fresh
    console.log('🧹 [ZEUS-SYNC] Clearing existing products...')
    await supabase.from('products').delete().neq('id', '')
    
    // Sync to Supabase
    const syncResult = await syncProductsToSupabase(products)
    
    // Log sync result
    await supabase.from('accurate_sync_logs').insert({
      sync_type: 'products_full',
      status: 'completed',
      records_processed: syncResult.stats.processed,
      records_created: syncResult.stats.created,
      records_updated: syncResult.stats.updated,
      records_failed: syncResult.stats.failed,
      details: {
        accurateResponse: {
          total: products.length
        },
        supabaseSync: syncResult.stats,
        errors: syncResult.errors || []
      }
    })
    
    console.log('✅ [ZEUS-SYNC] Full sync completed:', syncResult.stats)
    
    return NextResponse.json({
      success: true,
      message: `Full sync completed: ${syncResult.stats.processed} processed, ${syncResult.stats.created} created`,
      stats: syncResult.stats,
      errors: syncResult.errors
    })
    
  } catch (error: any) {
    console.error('❌ [ZEUS-SYNC] Full sync failed:', error)
    
    await supabase.from('accurate_sync_logs').insert({
      sync_type: 'products_full',
      status: 'failed',
      records_processed: 0,
      records_created: 0,
      records_updated: 0,
      records_failed: 0,
      details: {
        error: error.message,
        stack: error.stack
      }
    })
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Full sync failed'
    }, { status: 500 })
  }
}

/**
 * Sync products to Supabase database
 */
async function syncProductsToSupabase(products: any[]) {
  const stats = {
    processed: 0,
    created: 0,
    updated: 0,
    failed: 0
  }
  const errors: string[] = []
  
  console.log('💾 [ZEUS-SYNC] Starting Supabase sync for', products.length, 'products')
  
  for (const product of products) {
    stats.processed++
    
    try {
      // Map Accurate product to Supabase schema
      const supabaseProduct = {
        accurate_id: String(product.id),
        sku: product.itemNo || `ACC-${product.id}`,
        name: product.name,
        description: product.description || '',
        price: Number(product.unitPrice) || 0,
        cost_price: Number(product.averageCost) || 0,
        stock_quantity: Number(product.quantity) || 0,
        unit: product.unitOfMeasure || 'pcs',
        category_id: product.itemCategoryId ? String(product.itemCategoryId) : null,
        category_name: product.itemCategoryName || null,
        brand_id: product.brandId ? String(product.brandId) : null,
        brand_name: product.brandName || null,
        is_active: Boolean(product.isActive),
        accurate_last_modified: product.lastModified,
        accurate_created_date: product.createdDate,
        last_synced_at: new Date().toISOString()
      }
      
      // Check if product exists
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('accurate_id', supabaseProduct.accurate_id)
        .single()
      
      if (existingProduct) {
        // Update existing
        const { error } = await supabase
          .from('products')
          .update(supabaseProduct)
          .eq('accurate_id', supabaseProduct.accurate_id)
        
        if (error) throw error
        stats.updated++
        
        if (stats.updated % 10 === 0) {
          console.log(`📝 [ZEUS-SYNC] Updated ${stats.updated} products...`)
        }
      } else {
        // Create new
        const { error } = await supabase
          .from('products')
          .insert(supabaseProduct)
        
        if (error) throw error
        stats.created++
        
        if (stats.created % 10 === 0) {
          console.log(`📦 [ZEUS-SYNC] Created ${stats.created} products...`)
        }
      }
      
    } catch (error: any) {
      stats.failed++
      const errorMsg = `Product ${product.itemNo || product.id}: ${error.message}`
      errors.push(errorMsg)
      console.error('❌ [ZEUS-SYNC] Product sync error:', errorMsg)
    }
  }
  
  console.log('✅ [ZEUS-SYNC] Supabase sync completed:', stats)
  
  return {
    success: true,
    stats,
    errors: errors.length > 0 ? errors : undefined
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'POST method not supported. Use GET with action parameter.'
  }, { status: 405 })
} 