import { createClient } from '@supabase/supabase-js'

// Supabase Configuration
const supabaseUrl = 'https://xxedaynwrzqojlrpqzdz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDU0MTksImV4cCI6MjA2NDMyMTQxOX0.xyz6BJFSdW-9QvCe1jpjtGPlMzc8DbhboD9JwYXC5kQ'

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client untuk server operations
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODc0NTQxOSwiZXhwIjoyMDY0MzIxNDE5fQ.TBmLv-Loor7iwXjfHi_duVRqiZEjY6RMgwVMEubgqyo'

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Database types
export interface UserAddress {
  id: string
  user_id: string
  label: string
  recipient_name: string
  phone: string
  address_line: string
  city: string
  province: string
  postal_code?: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  shipping_address: any
  subtotal: number
  shipping_cost: number
  total_amount: number
  status: string
  payment_status: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image?: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

// Address management functions
export const addressService = {
  // Get user addresses
  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching user addresses:', error);
      throw error;
    }
    
    return data || []
  },

  // Create new address
  async createAddress(address: Omit<UserAddress, 'id' | 'created_at' | 'updated_at'>): Promise<UserAddress> {
    const { data, error } = await supabase
      .from('user_addresses')
      .insert({
        ...address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update address
  async updateAddress(addressId: string, updates: Partial<UserAddress>): Promise<UserAddress> {
    const { data, error } = await supabase
      .from('user_addresses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', addressId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete address
  async deleteAddress(addressId: string): Promise<void> {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId)
    
    if (error) throw error
  },

  // Set default address
  async setDefaultAddress(userId: string, addressId: string): Promise<UserAddress> {
    // First, unset all defaults for this user
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', userId)

    // Then set the new default
    const { data, error } = await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Order management functions
export const orderService = {
  // Create order
  async createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<Order> {
    // Generate order number
    const orderNumber = `HKI${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`
    
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        order_number: orderNumber,
        status: 'sedang_diperiksa_admin', // Default status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Create order items
  async createOrderItems(orderItems: Omit<OrderItem, 'id' | 'created_at'>[]): Promise<OrderItem[]> {
    console.log('🔧 Creating order items with data:', orderItems);
    
    try {
      const itemsToInsert = orderItems.map(item => ({
        ...item,
        created_at: new Date().toISOString()
      }));
      
      console.log('🔧 Items to insert:', itemsToInsert);
      
      // Try with regular client first
      let { data, error } = await supabase
        .from('order_items')
        .insert(itemsToInsert)
        .select()
      
      // If RLS error, try with service role (admin client)
      if (error && (error.message.includes('policy') || error.message.includes('permission'))) {
        console.log('🔄 Retrying with admin client due to RLS error...');
        
        const result = await supabaseAdmin
          .from('order_items')
          .insert(itemsToInsert)
          .select()
        
        data = result.data;
        error = result.error;
      }
      
      if (error) {
        console.error('❌ Supabase error details:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('✅ Order items created successfully:', data);
      return data || []
    } catch (err) {
      console.error('❌ Error in createOrderItems:', err);
      throw err;
    }
  },

  // Get user orders with items
  async getUserOrders(userId: string): Promise<(Order & { items?: OrderItem[] })[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data?.map(order => ({
      ...order,
      items: order.order_items
    })) || []
  },

  // Get order by ID with items
  async getOrderById(orderId: string): Promise<(Order & { items?: OrderItem[] }) | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single()
    
    if (error) throw error
    return data ? {
      ...data,
      items: data.order_items
    } : null
  }
}

// Typed Supabase client
export type SupabaseClient = typeof supabase 

export default supabase 