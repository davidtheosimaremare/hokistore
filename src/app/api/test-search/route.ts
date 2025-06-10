import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    console.log('🧪 [TEST-SEARCH] Testing search for:', query);
    
    // Test 1: Check database connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
      
    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError
      });
    }
    
    // Test 2: Get sample products with basic fields to check structure
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('id, name, category, brand, accurate_code, status, is_published, is_available_online, stock_quantity, price')
      .limit(5);
      
    if (sampleError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch sample products',
        details: sampleError
      });
    }
    
    // Test 3: Search if query provided with updated filters
    let searchResults: any[] = [];
    if (query) {
      const { data: products, error: searchError } = await supabase
        .from('products')
        .select('id, name, description, price, stock_quantity, category, accurate_code, brand, status, is_published, is_available_online, admin_thumbnail')
        .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
        .order('name', { ascending: true })
        .limit(20);
        
      if (searchError) {
        return NextResponse.json({
          success: false,
          error: 'Search failed',
          details: searchError
        });
      }
      
      // Apply same filters as Header component
      const filteredProducts = (products || []).filter(product => {
        const notSuspended = product.status !== 'suspended';
        const isOnline = product.is_available_online !== false;
        return notSuspended && isOnline;
      });
      
      searchResults = filteredProducts;
    }
    
    // Test 4: Count products by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('products')
      .select('status, is_published, is_available_online')
      .limit(1000);
      
    const stats = {
      total: statusCounts?.length || 0,
      active: statusCounts?.filter(p => p.status === 'active').length || 0,
      published: statusCounts?.filter(p => p.is_published === true).length || 0,
      available_online: statusCounts?.filter(p => p.is_available_online === true).length || 0,
      not_suspended: statusCounts?.filter(p => p.status !== 'suspended' && p.is_available_online !== false).length || 0
    };
    
    return NextResponse.json({
      success: true,
      query,
      connectionTest: 'OK',
      sampleProducts,
      searchResults,
      stats,
      message: `Database connection successful. Found ${stats.total} total products, ${stats.not_suspended} available for search.`
    });
    
  } catch (error: any) {
    console.error('🚨 [TEST-SEARCH] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error.message
    });
  }
} 