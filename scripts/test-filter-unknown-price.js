const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = 'https://xxedaynwrzqojlrpqzdz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDU0MTksImV4cCI6MjA2NDMyMTQxOX0.xyz6BJFSdW-9QvCe1jpjtGPlMzc8DbhboD9JwYXC5kQ'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCombinedFilter() {
  try {
    console.log('🧪 TESTING COMBINED FILTER (UNKNOWN + Price 0)');
    console.log('='.repeat(60));
    console.log('');

    // Get total count
    const { count: totalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total produk di database: ${totalCount}`);

    // Count UNKNOWN products
    const { count: unknownCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('name', 'UNKNOWN');

    console.log(`❌ Produk dengan nama "UNKNOWN": ${unknownCount}`);

    // Count products with price 0
    const { count: priceZeroCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('price', 0);

    console.log(`💰 Produk dengan harga 0: ${priceZeroCount}`);

    // Count products with UNKNOWN name AND price 0 (overlap)
    const { count: bothCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('name', 'UNKNOWN')
      .eq('price', 0);

    console.log(`🔄 Produk UNKNOWN AND harga 0 (overlap): ${bothCount}`);

    // Count products that will be filtered out (UNKNOWN OR price 0)
    const { count: filteredOutCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .or('name.eq.UNKNOWN,price.eq.0');

    console.log(`🚫 Total produk yang difilter (UNKNOWN OR harga 0): ${filteredOutCount}`);

    // Count valid products (NOT UNKNOWN AND price > 0)  
    const { count: validCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .neq('name', 'UNKNOWN')
      .gt('price', 0);

    console.log(`✅ Produk valid (nama bukan UNKNOWN AND harga > 0): ${validCount}`);

    console.log('');
    console.log('📈 STATISTIK DETAIL:');
    console.log(`   Total: ${totalCount}`);
    console.log(`   UNKNOWN: ${unknownCount} (${((unknownCount / totalCount) * 100).toFixed(1)}%)`);
    console.log(`   Harga 0: ${priceZeroCount} (${((priceZeroCount / totalCount) * 100).toFixed(1)}%)`);
    console.log(`   Overlap (UNKNOWN + harga 0): ${bothCount}`);
    console.log(`   Difilter: ${filteredOutCount} (${((filteredOutCount / totalCount) * 100).toFixed(1)}%)`);
    console.log(`   Valid: ${validCount} (${((validCount / totalCount) * 100).toFixed(1)}%)`);
    console.log('');

    // Get sample of valid products
    const { data: sampleValid } = await supabase
      .from('products')
      .select('name, category, price, accurate_code')
      .neq('name', 'UNKNOWN')
      .gt('price', 0)
      .limit(10);

    console.log('📝 Sample produk valid (nama bukan UNKNOWN dan harga > 0):');
    sampleValid.forEach((product, index) => {
      const price = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(product.price);
      console.log(`   ${index + 1}. ${product.name} - ${price} (${product.category})`);
    });

    console.log('');
    console.log(`🎯 HASIL AKHIR: Setelah filter gabungan, akan menampilkan ${validCount} produk dari ${totalCount} total produk`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the function
testCombinedFilter(); 