import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AccurateApiService } from '@/services/accurateApi'

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
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get sync logs
    const { data: logs, error } = await supabase
      .from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch sync logs' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: logs
    })

  } catch (error: any) {
    console.error('Get sync logs error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch sync logs',
      error: error.message
    }, { status: 500 })
  }
} 