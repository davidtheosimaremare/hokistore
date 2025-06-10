import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAccurateAPI, AccurateProduct } from '@/lib/accurateAPI'
import crypto from 'crypto'

interface WebhookEvent {
  event: 'item.created' | 'item.updated' | 'item.deleted'
  data: {
    id: string
    itemNo: string
    timestamp: string
  }
  signature: string
}

interface WebhookResult {
  success: boolean
  message: string
  processed?: number
  errors?: string[]
}

/**
 * Verify webhook signature from Accurate
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const timestamp = new Date().toISOString()
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    console.log('🔐 Webhook Signature Verification:', {
      timestamp,
      receivedSignature: signature,
      expectedSignature,
      secretLength: secret.length,
      secretPreview: `${secret.substring(0, 4)}****`,
      payloadLength: payload.length,
      payloadPreview: payload.substring(0, 100) + '...'
    })
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
    
    console.log(isValid ? '✅ Signature valid' : '❌ Signature invalid', {
      timestamp,
      isValid
    })
    
    return isValid
  } catch (error) {
    const timestamp = new Date().toISOString()
    console.error('❌ Signature verification error:', {
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
      signature,
      secretLength: secret.length,
      payloadLength: payload.length
    })
    return false
  }
}

/**
 * Handle webhook from Accurate API
 */
export async function POST(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString()
    const rawBody = await request.text()
    const signature = request.headers.get('x-accurate-signature') || ''
    const webhookSecret = process.env.ACCURATE_WEBHOOK_SECRET || ''

    console.log('📥 Webhook Request Received:', {
      timestamp,
      headers: {
        'x-accurate-signature': signature ? `${signature.substring(0, 10)}...` : 'not provided',
        'content-type': request.headers.get('content-type'),
        'user-agent': request.headers.get('user-agent')
      },
      bodyLength: rawBody.length,
      secretConfigured: !!webhookSecret,
      secretLength: webhookSecret.length
    })

    // Verify webhook signature if secret is configured
    if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('❌ Invalid webhook signature:', {
        timestamp,
        signature,
        secretLength: webhookSecret.length,
        bodyLength: rawBody.length
      })
      return NextResponse.json({
        success: false,
        message: 'Invalid signature'
      }, { status: 401 })
    }

    const webhookData: WebhookEvent = JSON.parse(rawBody)
    console.log('✅ Webhook event parsed successfully:', {
      timestamp,
      event: webhookData.event,
      itemId: webhookData.data.id,
      itemNo: webhookData.data.itemNo,
      eventTimestamp: webhookData.data.timestamp
    })

    // Log webhook receipt
    await logWebhookEvent(webhookData)

    let result: WebhookResult

    switch (webhookData.event) {
      case 'item.created':
        result = await handleItemCreated(webhookData.data)
        break
      
      case 'item.updated':
        result = await handleItemUpdated(webhookData.data)
        break
      
      case 'item.deleted':
        result = await handleItemDeleted(webhookData.data)
        break
      
      default:
        result = {
          success: false,
          message: `Unknown event type: ${webhookData.event}`
        }
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({
      success: false,
      message: 'Webhook processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Handle item created event
 */
async function handleItemCreated(data: WebhookEvent['data']): Promise<WebhookResult> {
  try {
    console.log(`Processing created item: ${data.id}`)

    const accurateAPI = getAccurateAPI()
    
    // Authenticate first
    const authenticated = await accurateAPI.authenticate()
    if (!authenticated) {
      return {
        success: false,
        message: 'Failed to authenticate with Accurate API'
      }
    }

    // Fetch the created product details
    const productsResponse = await accurateAPI.getProducts(1, 100) // We'll filter by ID
    if (!productsResponse.success) {
      return {
        success: false,
        message: `Failed to fetch product details: ${productsResponse.message}`
      }
    }

    // Find the specific product
    const product = productsResponse.data.find(p => p.id === data.id)
    if (!product) {
      return {
        success: false,
        message: `Product not found in Accurate: ${data.id}`
      }
    }

    // Check if product already exists in our database
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('accurate_id', product.id)
      .single()

    if (existingProduct) {
      return {
        success: true,
        message: 'Product already exists, no action needed',
        processed: 0
      }
    }

    // Insert new product
    const result = await insertProduct(product)
    if (result.success) {
      return {
        success: true,
        message: 'Product created successfully',
        processed: 1
      }
    } else {
      return {
        success: false,
        message: result.message,
        errors: [result.message]
      }
    }

  } catch (error) {
    console.error('Handle item created error:', error)
    return {
      success: false,
      message: 'Failed to process created item',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Handle item updated event
 */
async function handleItemUpdated(data: WebhookEvent['data']): Promise<WebhookResult> {
  try {
    console.log(`Processing updated item: ${data.id}`)

    const accurateAPI = getAccurateAPI()
    
    // Authenticate first
    const authenticated = await accurateAPI.authenticate()
    if (!authenticated) {
      return {
        success: false,
        message: 'Failed to authenticate with Accurate API'
      }
    }

    // Fetch the updated product details
    const productsResponse = await accurateAPI.getProducts(1, 100)
    if (!productsResponse.success) {
      return {
        success: false,
        message: `Failed to fetch product details: ${productsResponse.message}`
      }
    }

    // Find the specific product
    const product = productsResponse.data.find(p => p.id === data.id)
    if (!product) {
      return {
        success: false,
        message: `Product not found in Accurate: ${data.id}`
      }
    }

    // Update product in our database
    const result = await updateProduct(product)
    if (result.success) {
      return {
        success: true,
        message: 'Product updated successfully',
        processed: 1
      }
    } else {
      return {
        success: false,
        message: result.message,
        errors: [result.message]
      }
    }

  } catch (error) {
    console.error('Handle item updated error:', error)
    return {
      success: false,
      message: 'Failed to process updated item',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Handle item deleted event
 */
async function handleItemDeleted(data: WebhookEvent['data']): Promise<WebhookResult> {
  try {
    console.log(`Processing deleted item: ${data.id}`)

    // Find and soft delete the product
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .eq('accurate_id', data.id)
      .single()

    if (fetchError || !product) {
      return {
        success: true,
        message: 'Product not found in database, no action needed',
        processed: 0
      }
    }

    // Soft delete by setting status to inactive
    const { error: updateError } = await supabase
      .from('products')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString(),
        accurate_last_modified: new Date().toISOString()
      })
      .eq('id', product.id)

    if (updateError) {
      return {
        success: false,
        message: `Failed to delete product: ${updateError.message}`,
        errors: [updateError.message]
      }
    }

    return {
      success: true,
      message: 'Product marked as inactive successfully',
      processed: 1
    }

  } catch (error) {
    console.error('Handle item deleted error:', error)
    return {
      success: false,
      message: 'Failed to process deleted item',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Insert new product
 */
async function insertProduct(product: AccurateProduct): Promise<{ success: boolean; message: string }> {
  try {
    const productData = {
      name: product.name,
      description: product.description || null,
      price: product.unitPrice || 0,
      stock_quantity: Math.floor(product.quantity || 0),
      category: product.itemCategoryName || 'Uncategorized',
      brand: product.brandName || null,
      model: product.itemNo || null,
      status: product.isActive ? 'active' : 'inactive',
      accurate_id: product.id,
      accurate_item_no: product.itemNo,
      accurate_last_modified: product.lastModified,
      unit_of_measure: product.unitOfMeasure || 'pcs',
      average_cost: product.averageCost || 0,
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('products')
      .insert(productData)

    if (error) {
      return {
        success: false,
        message: `Failed to insert product: ${error.message}`
      }
    }

    return {
      success: true,
      message: 'Product inserted successfully'
    }

  } catch (error) {
    return {
      success: false,
      message: `Insert error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Update existing product
 */
async function updateProduct(product: AccurateProduct): Promise<{ success: boolean; message: string }> {
  try {
    const productData = {
      name: product.name,
      description: product.description || null,
      price: product.unitPrice || 0,
      stock_quantity: Math.floor(product.quantity || 0),
      category: product.itemCategoryName || 'Uncategorized',
      brand: product.brandName || null,
      model: product.itemNo || null,
      status: product.isActive ? 'active' : 'inactive',
      accurate_item_no: product.itemNo,
      accurate_last_modified: product.lastModified,
      unit_of_measure: product.unitOfMeasure || 'pcs',
      average_cost: product.averageCost || 0,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('accurate_id', product.id)

    if (error) {
      return {
        success: false,
        message: `Failed to update product: ${error.message}`
      }
    }

    return {
      success: true,
      message: 'Product updated successfully'
    }

  } catch (error) {
    return {
      success: false,
      message: `Update error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Log webhook event
 */
async function logWebhookEvent(webhookData: WebhookEvent): Promise<void> {
  try {
    await supabase
      .from('accurate_sync_logs')
      .insert({
        sync_type: 'webhook',
        status: 'running',
        records_processed: 1,
        records_created: 0,
        records_updated: 0,
        records_failed: 0,
        started_at: new Date().toISOString(),
        sync_details: {
          event: webhookData.event,
          item_id: webhookData.data.id,
          item_no: webhookData.data.itemNo,
          timestamp: webhookData.data.timestamp
        }
      })
  } catch (error) {
    console.error('Failed to log webhook event:', error)
  }
}

/**
 * GET method for webhook verification (if needed by Accurate)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')
  const verify_token = searchParams.get('hub.verify_token')

  // Verify token if provided
  if (verify_token && verify_token !== process.env.ACCURATE_WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ error: 'Invalid verify token' }, { status: 403 })
  }

  // Return challenge for webhook verification
  if (challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }

  return NextResponse.json({
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
} 