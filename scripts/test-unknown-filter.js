const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = 'https://xxedaynwrzqojlrpqzdz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDU0MTksImV4cCI6MjA2NDMyMTQxOX0.xyz6BJFSdW-9QvCe1jpjtGPlMzc8DbhboD9JwYXC5kQ'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUnknownFilter() {
  try {
    console.log('🧪 TESTING UNKNOWN FILTER');
    console.log('='.repeat(50));
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

    // Count non-UNKNOWN products  
    const { count: validCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .neq('name', 'UNKNOWN');

    console.log(`✅ Produk dengan nama valid: ${validCount}`);

    console.log('');
    console.log('📈 STATISTIK:');
    console.log(`   Total: ${totalCount}`);
    console.log(`   UNKNOWN: ${unknownCount} (${((unknownCount / totalCount) * 100).toFixed(1)}%)`);
    console.log(`   Valid: ${validCount} (${((validCount / totalCount) * 100).toFixed(1)}%)`);
    console.log('');

    // Get sample of valid products
    const { data: sampleValid } = await supabase
      .from('products')
      .select('name, category, accurate_code')
      .neq('name', 'UNKNOWN')
      .limit(10);

    console.log('📝 Sample produk dengan nama valid:');
    sampleValid.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.category})`);
    });

    console.log('');
    console.log(`🎯 HASIL: Setelah filter, akan menampilkan ${validCount} produk dari ${totalCount} total produk`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the function
testUnknownFilter(); 