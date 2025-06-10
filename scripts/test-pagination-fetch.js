const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = 'https://xxedaynwrzqojlrpqzdz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDU0MTksImV4cCI6MjA2NDMyMTQxOX0.xyz6BJFSdW-9QvCe1jpjtGPlMzc8DbhboD9JwYXC5kQ'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPaginationFetch() {
  try {
    console.log('🧪 TESTING PAGINATION FETCH (hook baru)');
    console.log('='.repeat(50));
    console.log('');

    console.log('🔄 Fetching ALL products from Supabase with pagination...');

    const PAGE_SIZE = 1000;
    let allData = [];
    let currentPage = 0;
    let hasMore = true;

    // Get total count first
    const { count: totalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total products in database: ${totalCount}`);

    // Fetch all data with pagination
    while (hasMore) {
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      console.log(`📦 Fetching page ${currentPage + 1} (${from + 1}-${Math.min(to + 1, totalCount || 0)})...`);

      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        currentPage++;
        
        // Check if we have more data
        hasMore = data.length === PAGE_SIZE;
        console.log(`   ✅ Page ${currentPage}: ${data.length} products fetched`);
      } else {
        hasMore = false;
        console.log(`   ⚪ Page ${currentPage + 1}: No more data`);
      }
    }

    console.log('');
    console.log('📈 HASIL PAGINATION:');
    console.log(`   Database count (total): ${totalCount}`);
    console.log(`   Data fetched (actual): ${allData.length}`);
    console.log(`   Pages fetched: ${currentPage}`);
    console.log(`   Success rate: ${totalCount === allData.length ? '100%' : ((allData.length / totalCount) * 100).toFixed(1) + '%'}`);
    console.log('');

    if (totalCount === allData.length) {
      console.log('🎉 BERHASIL! Semua produk berhasil di-fetch dengan pagination!');
    } else {
      console.log('⚠️ Masih ada perbedaan. Perlu investigasi lebih lanjut.');
    }

    // Check categories
    const uniqueCategories = Array.from(
      new Set(
        allData
          .map(p => p.category)
          .filter(cat => Boolean(cat && cat.trim()))
      )
    ).sort();

    console.log(`📂 Categories found: ${uniqueCategories.length}`);
    console.log(`   Sample categories: ${uniqueCategories.slice(0, 5).join(', ')}`);

    // Sample products
    console.log('');
    console.log('📝 Sample products:');
    allData.slice(0, 3).forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name || 'UNKNOWN'} (${product.category})`);
    });

    console.log('');
    console.log('✅ Test pagination selesai!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the function
testPaginationFetch(); 