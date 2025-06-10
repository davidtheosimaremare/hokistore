import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AccurateApiService } from '@/services/accurateApi'
import { getApiHeaders } from '@/utils/crypto'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get sync configuration from request body
    const body = await request.json()
    const { 
      syncAll = false, 
      syncSiemens = true, 
      limit = 50,
      upsertMode = true 
    } = body

    let syncedProducts = 0
    let errors: string[] = []

    try {
      // Fetch products from Accurate API
      let products: any[] = []
      
      if (syncAll) {
        console.log('Fetching all products from Accurate API...')
        products = await AccurateApiService.getAllProducts(limit)
      } else if (syncSiemens) {
        console.log('Fetching Siemens products from Accurate API...')
        products = await AccurateApiService.getSiemensProducts(limit)
      }

      console.log(`Found ${products.length} products to sync`)

      // Process and upsert products to Supabase
      if (products.length > 0) {
        const processedProducts = products.map(product => ({
          accurate_id: product.id || product.No,
          name: product.name || product.Name,
          description: product.description || product.Description || '',
          price: parseFloat(product.unitPrice || product.UnitPrice || '0'),
          stock: parseInt(product.stock || product.Stock || '0'),
          category: product.category || product.Category || 'Uncategorized',
          brand: product.brand || 'Siemens',
          sku: product.sku || product.SKU || product.No,
          image_url: product.imageUrl || null,
          status: 'active',
          // Additional metadata
          meta_data: {
            sync_date: new Date().toISOString(),
            source: 'accurate_api',
            original_data: product
          },
          updated_at: new Date().toISOString()
        }))

        if (upsertMode) {
          // Use upsert to insert or update existing products
          const { data: upsertData, error: upsertError } = await supabase
            .from('products')
            .upsert(processedProducts, { 
              onConflict: 'accurate_id',
              ignoreDuplicates: false 
            })
            .select()

          if (upsertError) {
            errors.push(`Upsert error: ${upsertError.message}`)
          } else {
            syncedProducts = processedProducts.length
          }
        } else {
          // Insert new products only
          const { data: insertData, error: insertError } = await supabase
            .from('products')
            .insert(processedProducts)
            .select()

          if (insertError) {
            errors.push(`Insert error: ${insertError.message}`)
          } else {
            syncedProducts = processedProducts.length
          }
        }
      }

      // Log sync activity
      const { error: logError } = await supabase
        .from('sync_logs')
        .insert({
          user_id: session.user.id,
          sync_type: syncAll ? 'all_products' : 'siemens_products',
          products_synced: syncedProducts,
          errors: errors,
          status: errors.length > 0 ? 'partial_success' : 'success',
          created_at: new Date().toISOString()
        })

      if (logError) {
        console.error('Failed to log sync activity:', logError)
      }

      return NextResponse.json({
        success: true,
        message: `Successfully synced ${syncedProducts} products`,
        data: {
          syncedProducts,
          totalFetched: products.length,
          errors,
          syncType: syncAll ? 'all_products' : 'siemens_products'
        }
      })

    } catch (apiError: any) {
      errors.push(`API Error: ${apiError.message}`)
      
      return NextResponse.json({
        success: false,
        message: 'Failed to sync products from Accurate API',
        error: apiError.message,
        errors
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Sync products error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error during product sync',
      error: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'sync'
  
  try {
    const timestamp = new Date().toISOString()
    
    console.log('🚀 [ZEUS-SYNC-V2] Starting Accurate sync:', {
      timestamp,
      action,
      userAgent: request.headers.get('user-agent'),
      origin: request.headers.get('origin')
    })

    switch (action) {
      case 'test-connection':
        return await handleTestConnection()
      
      case 'sync':
        return await handleProductSync()
      
      case 'full-sync':
        return await handleFullSync()
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: test-connection, sync, or full-sync'
        }, { status: 400 })
    }
    
  } catch (error: any) {
    console.error('❌ [ZEUS-SYNC-V2] API error:', {
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
 * Test connection to Zeus Accurate using working endpoint
 */
async function handleTestConnection() {
  try {
    console.log('🔍 [ZEUS-SYNC-V2] Testing connection...')
    
    const headers = getApiHeaders()
    const accurateUrl = `https://zeus.accurate.id/accurate/api/item/list.do?sp.pageSize=1&sp.page=0&fields=id,name,unitPrice,no,availableToSell,stock,unitName,itemCategory,description,isActive,itemType,itemTypeName,shortName,hasExpiry,unit1Name,unit1NameWarehouse,unit2Name,unit2NameWarehouse,unit3Name,unit3NameWarehouse,unitConversion1,unitConversion2,unitConversion3,detailWarehouseData,detailSellingPrice,balance,suspended,detailItemImage`
    
    console.log('🔗 [ZEUS-SYNC-V2] Testing with URL:', accurateUrl)
    
    const response = await fetch(accurateUrl, {
      method: 'GET',
      headers: headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.s) {
      throw new Error(data.message || 'API returned unsuccessful response')
    }
    
    const totalProducts = data.sp?.rowCount || 0
    
    console.log('✅ [ZEUS-SYNC-V2] Connection test successful:', {
      totalProducts,
      pagination: data.sp
    })
    
    return NextResponse.json({
      success: true,
      message: `✅ Koneksi berhasil! ${totalProducts} produk tersedia`,
      connection: {
        status: 'connected',
        totalProducts,
        pagination: data.sp
      }
    })
    
  } catch (error: any) {
    console.error('❌ [ZEUS-SYNC-V2] Connection test failed:', error)
    
    return NextResponse.json({
      success: false,
      message: `❌ ${error.message}`,
      error: error.message
    }, { status: 500 })
  }
}

/**
 * Full sync all products from Zeus Accurate
 */
async function handleFullSync() {
  try {
    console.log('🔄 [ZEUS-SYNC-V2] Starting FULL product sync...')
    
    // First get total count
    const headers = getApiHeaders()
    const testUrl = `https://zeus.accurate.id/accurate/api/item/list.do?sp.pageSize=1&sp.page=0&fields=id,name,unitPrice,no,availableToSell,stock,unitName,itemCategory,description,isActive,itemType,itemTypeName,shortName,hasExpiry,unit1Name,unit1NameWarehouse,unit2Name,unit2NameWarehouse,unit3Name,unit3NameWarehouse,unitConversion1,unitConversion2,unitConversion3,detailWarehouseData,detailSellingPrice,balance,suspended,detailItemImage`
    
    const testResponse = await fetch(testUrl, {
      method: 'GET',
      headers: headers,
    })
    
    if (!testResponse.ok) {
      throw new Error(`Connection test failed: ${testResponse.status} ${testResponse.statusText}`)
    }
    
    const testData = await testResponse.json()
    if (!testData.s) {
      throw new Error(testData.message || 'API connection failed')
    }
    
    const totalProducts = testData.sp?.rowCount || 0
    const totalPages = testData.sp?.pageCount || 0
    
    console.log(`📊 [ZEUS-SYNC-V2] Found ${totalProducts} products in ${totalPages} pages`)
    
    if (totalProducts === 0) {
      return NextResponse.json({
        success: true,
        message: 'No products found in Accurate',
        stats: { processed: 0, created: 0, updated: 0, failed: 0 }
      })
    }
    
    // Clear existing products
    console.log('🧹 [ZEUS-SYNC-V2] Clearing existing products...')
    await supabase.from('products').delete().neq('id', '')
    
    // Fetch all products page by page
    const allProducts = []
    const pageSize = 100 // Larger page size for efficiency
    let currentPage = 0
    
    while (currentPage < totalPages) {
      console.log(`📄 [ZEUS-SYNC-V2] Fetching page ${currentPage + 1}/${totalPages}...`)
      
      const pageUrl = `https://zeus.accurate.id/accurate/api/item/list.do?sp.pageSize=${pageSize}&sp.page=${currentPage}&fields=id,name,unitPrice,no,availableToSell,stock,unitName,itemCategory,description,isActive,itemType,itemTypeName,shortName,hasExpiry,unit1Name,unit1NameWarehouse,unit2Name,unit2NameWarehouse,unit3Name,unit3NameWarehouse,unitConversion1,unitConversion2,unitConversion3,detailWarehouseData,detailSellingPrice,balance,suspended,detailItemImage`
      
      const pageResponse = await fetch(pageUrl, {
        method: 'GET',
        headers: getApiHeaders(), // Generate fresh headers for each request
      })
      
      if (!pageResponse.ok) {
        throw new Error(`Failed to fetch page ${currentPage + 1}: ${pageResponse.status} ${pageResponse.statusText}`)
      }
      
      const pageData = await pageResponse.json()
      
      if (!pageData.s) {
        throw new Error(`API error on page ${currentPage + 1}: ${pageData.message || 'Unknown error'}`)
      }
      
      const products = pageData.d || []
      allProducts.push(...products)
      
      console.log(`✅ [ZEUS-SYNC-V2] Page ${currentPage + 1}/${totalPages}: ${products.length} products`)
      
      currentPage++
      
      // Add delay to avoid rate limiting
      if (currentPage < totalPages) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    
    console.log(`📦 [ZEUS-SYNC-V2] Fetched ${allProducts.length} total products`)
    
    // Sync to Supabase
    const syncResult = await syncProductsToSupabase(allProducts)
    
    // Log sync result
    await supabase.from('accurate_sync_logs').insert({
      sync_type: 'products_full_v2',
      status: 'completed',
      records_processed: syncResult.stats.processed,
      records_created: syncResult.stats.created,
      records_updated: syncResult.stats.updated,
      records_failed: syncResult.stats.failed,
      details: {
        accurateResponse: {
          total: allProducts.length,
          totalPages,
          pageSize
        },
        supabaseSync: syncResult.stats,
        errors: syncResult.errors || []
      }
    })
    
    console.log('✅ [ZEUS-SYNC-V2] Full sync completed:', syncResult.stats)
    
    return NextResponse.json({
      success: true,
      message: `Full sync completed: ${syncResult.stats.processed} processed, ${syncResult.stats.created} created`,
      stats: syncResult.stats,
      errors: syncResult.errors
    })
    
  } catch (error: any) {
    console.error('❌ [ZEUS-SYNC-V2] Full sync failed:', error)
    
    await supabase.from('accurate_sync_logs').insert({
      sync_type: 'products_full_v2',
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
 * Regular incremental sync
 */
async function handleProductSync() {
  try {
    console.log('🔄 [ZEUS-SYNC-V2] Starting incremental sync...')
    
    // For now, just do a full sync
    // TODO: Implement incremental sync based on lastModified
    return await handleFullSync()
    
  } catch (error: any) {
    console.error('❌ [ZEUS-SYNC-V2] Sync failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Sync failed'
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
  
  console.log('💾 [ZEUS-SYNC-V2] Starting Supabase sync for', products.length, 'products')
  
  for (const product of products) {
    stats.processed++
    
    try {
      // Map Accurate product to Supabase schema - USING CORRECT ACCURATE FIELDS
      const supabaseProduct = {
        // Core identification
        accurate_id: String(product.id),
        accurate_code: product.no || null,
        
        // Basic product info
        name: product.name || `Product ${product.id}`,
        description: product.description || product.shortName || '',
        short_description: product.shortName || (product.description ? product.description.substring(0, 500) : ''),
        
        // Pricing
        price: Number(product.unitPrice) || 0,
        cost_price: 0, // Not available in provided fields
        
        // Inventory
        stock_quantity: Number(product.availableToSell) || Number(product.stock) || Number(product.balance) || 0,
        min_stock: 0,
        unit: product.unitName || product.unit1Name || 'pcs',
        
        // Categorization
        category: product.itemCategory?.name || product.itemTypeName || 'Uncategorized',
        subcategory: product.itemType || null,
        brand: null, // Not available in provided fields
        model: product.no || null,
        
        // Technical specifications (JSONB field for all Accurate metadata)
        specifications: {
          accurate_no: product.no,
          accurate_item_type: product.itemType,
          accurate_item_type_name: product.itemTypeName,
          accurate_short_name: product.shortName,
          accurate_has_expiry: product.hasExpiry,
          accurate_available_to_sell: product.availableToSell,
          accurate_balance: product.balance,
          accurate_suspended: product.suspended,
          accurate_is_active: product.isActive,
          accurate_unit_name: product.unitName,
          accurate_item_category: product.itemCategory,
          accurate_unit1_name: product.unit1Name,
          accurate_unit1_name_warehouse: product.unit1NameWarehouse,
          accurate_unit2_name: product.unit2Name,
          accurate_unit2_name_warehouse: product.unit2NameWarehouse,
          accurate_unit3_name: product.unit3Name,
          accurate_unit3_name_warehouse: product.unit3NameWarehouse,
          accurate_unit_conversion1: product.unitConversion1,
          accurate_unit_conversion2: product.unitConversion2,
          accurate_unit_conversion3: product.unitConversion3,
          accurate_detail_warehouse_data: product.detailWarehouseData,
          accurate_detail_selling_price: product.detailSellingPrice,
          accurate_detail_item_image: product.detailItemImage, // Simpan sebagai referensi saja
          sync_timestamp: new Date().toISOString()
        },
        
        // Media (tidak ambil dari Accurate, akan diupload manual)
        features: [],
        images: [], // Kosong, tidak ambil dari Accurate
        thumbnail: null, // Kosong, tidak ambil dari Accurate
        admin_thumbnail: null, // Thumbnail yang diupload admin (maksimal 1)
        admin_slide_images: [], // Array gambar slide yang diupload admin (multiple)
        
        // SEO
        slug: null,
        seo_title: null,
        seo_description: null,
        seo_keywords: [],
        
        // Status & visibility
        status: (product.isActive && !product.suspended) ? 'active' : 'inactive',
        is_featured: false,
        is_published: false, // Default tidak tayang, perlu diatur manual
        is_available_online: true, // Default tersedia online
        display_order: 0, // Default urutan tampil
        
        // Timestamps
        updated_at: new Date().toISOString(),
        last_sync_accurate: new Date().toISOString()
      }
      
      // Insert/Update product using upsert
      const { error } = await supabase
        .from('products')
        .upsert(supabaseProduct, { 
          onConflict: 'accurate_id',
          ignoreDuplicates: false 
        })
      
      if (error) throw error
      stats.created++
      
      if (stats.created % 50 === 0) {
        console.log(`📦 [ZEUS-SYNC-V2] Synced ${stats.created}/${products.length} products...`)
      }
      
    } catch (error: any) {
      stats.failed++
      const errorMsg = `Product ${product.no || product.id}: ${error.message}`
      errors.push(errorMsg)
      console.error('❌ [ZEUS-SYNC-V2] Product sync error:', errorMsg)
    }
  }
  
  console.log('✅ [ZEUS-SYNC-V2] Supabase sync completed:', stats)
  
  return {
    success: true,
    stats,
    errors: errors.length > 0 ? errors : undefined
  }
} 