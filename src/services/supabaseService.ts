import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// User Profile Service
export const profileService = {
  // Get user profile by ID
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  },

  // Create new user profile
  async createProfile(user: User, additionalData?: {
    full_name?: string;
    company_name?: string;
    phone?: string;
  }) {
    const profileData = {
      id: user.id,
      email: user.email!,
      full_name: additionalData?.full_name || user.user_metadata?.full_name || null,
      company_name: additionalData?.company_name || null,
      phone: additionalData?.phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    return { data, error };
  },

  // Update user profile
  async updateProfile(userId: string, updates: {
    full_name?: string;
    company_name?: string;
    phone?: string;
  }) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  },

  // Delete user profile
  async deleteProfile(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    return { error };
  },
};

// Orders Service (for future use)
export const ordersService = {
  // Get user orders
  async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Create new order
  async createOrder(orderData: {
    user_id: string;
    items: any[];
    total_amount: number;
    shipping_address: any;
    status?: string;
  }) {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        status: orderData.status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    return { data, error };
  },
};

// Products Service (if storing products in Supabase)
export const productsService = {
  // Get all products with pagination
  async getProducts(page = 1, limit = 20, filters?: {
    category?: string;
    search?: string;
    in_stock?: boolean;
  }) {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
    }

    if (filters?.in_stock !== undefined) {
      query = query.eq('in_stock', filters.in_stock);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    return { 
      data, 
      error, 
      count,
      totalPages: count ? Math.ceil(count / limit) : 0 
    };
  },

  // Get product by ID
  async getProduct(productId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    return { data, error };
  },

  // Get products by category
  async getProductsByCategory(category: string, limit = 10) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('in_stock', true)
      .limit(limit);

    return { data, error };
  },
};

// Categories Service
export const categoriesService = {
  // Get all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    return { data, error };
  },

  // Get category by slug
  async getCategoryBySlug(slug: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    return { data, error };
  },
};

// Analytics Service (for admin)
export const analyticsService = {
  // Get dashboard stats
  async getDashboardStats() {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        data: {
          totalUsers,
          totalOrders,
          totalProducts,
          recentOrders,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
      };
    }
  },
};

// File Storage Service
export const storageService = {
  // Upload file to Supabase storage
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    return { data, error };
  },

  // Get public URL for file
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  // Delete file
  async deleteFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    return { data, error };
  },

  // Get file list
  async getFileList(bucket: string, folder = '') {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    return { data, error };
  },
};

// Utility functions for common patterns
export const supabaseHelpers = {
  // Check if user has permission
  async checkUserPermission(userId: string, permission: string) {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId)
      .eq('permission', permission)
      .single();

    return { hasPermission: !!data && !error, error };
  },

  // Log user activity
  async logActivity(userId: string, action: string, details?: any) {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action,
        details,
        created_at: new Date().toISOString(),
      });

    return { error };
  },

  // Get system settings
  async getSystemSettings() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*');

    return { data, error };
  },
}; 