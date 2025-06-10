const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = 'https://xxedaynwrzqojlrpqzdz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDU0MTksImV4cCI6MjA2NDMyMTQxOX0.xyz6BJFSdW-9QvCe1jpjtGPlMzc8DbhboD9JwYXC5kQ'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseFetch() {
  try {
    console.log('🧪 TESTING SUPABASE FETCH (sama seperti hook)');
    console.log('='.repeat(50));
    console.log('');

    console.log('🔄 Fetching ALL products from Supabase...');

    // Replicate exact query from hook
    const { data, error: supabaseError, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    console.log(`📊 Total products in database: ${count}`);
    console.log(`📦 Products fetched: ${data ? data.length : 0}`);

    if (supabaseError) {
      console.error('❌ Supabase error:', supabaseError);
      return;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No products found in Supabase');
      return;
    }

    console.log('');
    console.log('📈 HASIL:');
    console.log(`   Database count (total): ${count}`);
    console.log(`   Data fetched (actual): ${data.length}`);
    console.log(`   Difference: ${count - data.length}`);
    console.log('');

    if (count !== data.length) {
      console.log('⚠️ ADA PERBEDAAN! Kemungkinan penyebab:');
      console.log('   1. Row Level Security (RLS) membatasi akses');
      console.log('   2. Ada limit default dari Supabase');
      console.log('   3. Data corruption atau access issues');
      console.log('');

      // Test dengan limit eksplisit
      console.log('🔍 Testing dengan limit berbeda...');
      
      const { data: dataWithLimit, count: countWithLimit } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .limit(1000);

      console.log(`   Dengan limit 1000: ${dataWithLimit.length} produk`);

      const { data: dataWithBigLimit, count: countWithBigLimit } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .limit(10000);

      console.log(`   Dengan limit 10000: ${dataWithBigLimit.length} produk`);
    } else {
      console.log('✅ Semua produk berhasil di-fetch!');
    }

    // Check categories
    const uniqueCategories = Array.from(
      new Set(
        data
          .map(p => p.category)
          .filter(cat => Boolean(cat && cat.trim()))
      )
    ).sort();

    console.log(`📂 Categories found: ${uniqueCategories.length}`);
    console.log(`   Top 10: ${uniqueCategories.slice(0, 10).join(', ')}`);

    // Check first few products
    console.log('');
    console.log('📝 First 3 products:');
    data.slice(0, 3).forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name || 'UNKNOWN'} (${product.category})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the function
testSupabaseFetch(); 