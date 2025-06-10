const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = 'https://xxedaynwrzqojlrpqzdz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDU0MTksImV4cCI6MjA2NDMyMTQxOX0.xyz6BJFSdW-9QvCe1jpjtGPlMzc8DbhboD9JwYXC5kQ'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analyzeProductNames() {
  try {
    console.log('🔍 MENGANALISIS NAMA PRODUK');
    console.log('='.repeat(50));
    console.log('');

    // Get sample products to analyze
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, model, accurate_code, description, category, specifications')
      .limit(20);

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    console.log(`📊 Menganalisis ${products.length} produk sampel:`);
    console.log('');

    let unknownCount = 0;
    let hasModelCount = 0;
    let hasDescriptionCount = 0;

    products.forEach((product, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. ANALISIS PRODUK:`);
      console.log(`    ID: ${product.id}`);
      console.log(`    Name: "${product.name || 'NULL'}"`);
      console.log(`    Model: "${product.model || 'NULL'}"`);
      console.log(`    Accurate Code: "${product.accurate_code || 'NULL'}"`);
      console.log(`    Category: "${product.category || 'NULL'}"`);
      console.log(`    Description: "${product.description ? product.description.substring(0, 100) : 'NULL'}..."`);
      
      if (product.specifications) {
        try {
          if (typeof product.specifications === 'string') {
            const specs = JSON.parse(product.specifications);
            console.log(`    Specifications Keys: ${Object.keys(specs).join(', ')}`);
          } else {
            console.log(`    Specifications Keys: ${Object.keys(product.specifications).join(', ')}`);
          }
        } catch (e) {
          console.log(`    Specifications: ${typeof product.specifications === 'string' ? product.specifications.substring(0, 50) : JSON.stringify(product.specifications).substring(0, 50)}...`);
        }
      }

      // Count patterns
      if (product.name === 'UNKNOWN' || !product.name) {
        unknownCount++;
      }
      if (product.model) {
        hasModelCount++;
      }
      if (product.description) {
        hasDescriptionCount++;
      }

      console.log('    ' + '-'.repeat(60));
      console.log('');
    });

    console.log('📈 RINGKASAN ANALISIS:');
    console.log(`   Produk dengan nama "UNKNOWN" atau kosong: ${unknownCount}/${products.length}`);
    console.log(`   Produk yang memiliki Model: ${hasModelCount}/${products.length}`);
    console.log(`   Produk yang memiliki Description: ${hasDescriptionCount}/${products.length}`);
    console.log('');

    // Check total counts
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: unknownTotal } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('name', 'UNKNOWN');

    const { count: nullNameTotal } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .is('name', null);

    console.log('📊 STATISTIK KESELURUHAN:');
    console.log(`   Total produk: ${totalProducts}`);
    console.log(`   Nama "UNKNOWN": ${unknownTotal}`);
    console.log(`   Nama NULL: ${nullNameTotal}`);
    console.log(`   Nama bermasalah: ${unknownTotal + nullNameTotal} (${((unknownTotal + nullNameTotal) / totalProducts * 100).toFixed(1)}%)`);
    console.log('');

    console.log('💡 REKOMENDASI SOLUSI:');
    console.log('   1. Gunakan MODEL sebagai nama jika nama adalah "UNKNOWN"');
    console.log('   2. Gunakan CATEGORY + MODEL sebagai kombinasi nama');
    console.log('   3. Parse SPECIFICATIONS untuk mencari nama yang lebih baik');
    console.log('   4. Fallback ke ACCURATE_CODE jika tidak ada opsi lain');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the function
analyzeProductNames(); 