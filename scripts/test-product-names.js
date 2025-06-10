const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = 'https://xxedaynwrzqojlrpqzdz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDU0MTksImV4cCI6MjA2NDMyMTQxOX0.xyz6BJFSdW-9QvCe1jpjtGPlMzc8DbhboD9JwYXC5kQ'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Replicate the helper function logic
function getDisplayName(product) {
  // If name exists and is not "UNKNOWN", use it
  if (product.name && product.name !== 'UNKNOWN') {
    return product.name;
  }

  // Try to build a meaningful name from available data
  let displayName = '';

  // Option 1: Use category + model
  if (product.category && product.model) {
    displayName = `${product.category} ${product.model}`;
  }
  // Option 2: Use just model if it's descriptive
  else if (product.model && product.model.length > 3) {
    displayName = product.model;
  }
  // Option 3: Use category + accurate_code
  else if (product.category && product.accurate_code) {
    displayName = `${product.category} ${product.accurate_code}`;
  }
  // Option 4: Use just accurate_code
  else if (product.accurate_code) {
    displayName = product.accurate_code;
  }
  // Option 5: Extract from description
  else if (product.description) {
    // Try to extract a meaningful name from description
    const desc = product.description.substring(0, 50).trim();
    displayName = desc.endsWith('...') ? desc.slice(0, -3) : desc;
  }
  // Fallback
  else {
    displayName = product.category || 'Produk Tanpa Nama';
  }

  return displayName.trim();
}

function getProductCode(product) {
  return product.accurate_code || product.model || null;
}

async function testProductNames() {
  try {
    console.log('🧪 TESTING PERBAIKAN NAMA PRODUK');
    console.log('='.repeat(50));
    console.log('');

    // Test dengan produk yang bermasalah
    const { data: unknownProducts, error } = await supabase
      .from('products')
      .select('id, name, model, accurate_code, description, category')
      .eq('name', 'UNKNOWN')
      .limit(10);

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    console.log(`🔍 Testing ${unknownProducts.length} produk dengan nama "UNKNOWN":`);
    console.log('');

    unknownProducts.forEach((product, index) => {
      const originalName = product.name;
      const newName = getDisplayName(product);
      const productCode = getProductCode(product);

      console.log(`${(index + 1).toString().padStart(2, '0')}. PERBANDINGAN:`);
      console.log(`    ID: ${product.id}`);
      console.log(`    SEBELUM: "${originalName}"`);
      console.log(`    SESUDAH: "${newName}"`);
      console.log(`    KODE: "${productCode || 'Tidak ada'}"`);
      console.log(`    KATEGORI: "${product.category || 'Tidak ada'}"`);
      console.log(`    MODEL: "${product.model || 'Tidak ada'}"`);
      console.log(`    ACCURATE CODE: "${product.accurate_code || 'Tidak ada'}"`);
      console.log(`    ✅ IMPROVEMENT: ${originalName !== newName ? 'YA' : 'TIDAK'}`);
      console.log('    ' + '-'.repeat(60));
      console.log('');
    });

    // Test juga beberapa produk yang sudah bagus
    const { data: goodProducts, error: error2 } = await supabase
      .from('products')
      .select('id, name, model, accurate_code, description, category')
      .not('name', 'eq', 'UNKNOWN')
      .limit(5);

    if (!error2 && goodProducts.length > 0) {
      console.log('🔍 Testing produk dengan nama yang sudah baik:');
      console.log('');

      goodProducts.forEach((product, index) => {
        const originalName = product.name;
        const newName = getDisplayName(product);

        console.log(`${(index + 1).toString().padStart(2, '0')}. PRODUK BAIK:`);
        console.log(`    NAMA: "${originalName}"`);
        console.log(`    HASIL: "${newName}"`);
        console.log(`    STATUS: ${originalName === newName ? 'Tetap sama ✅' : 'Berubah ⚠️'}`);
        console.log('    ' + '-'.repeat(40));
        console.log('');
      });
    }

    console.log('✅ Testing selesai!');
    console.log('💡 Helper function bekerja dengan logic:');
    console.log('   1. Jika nama bukan "UNKNOWN" → gunakan nama asli');
    console.log('   2. Jika ada kategori + model → gabungkan keduanya');
    console.log('   3. Jika ada model saja → gunakan model');
    console.log('   4. Jika ada kategori + kode → gabungkan keduanya');
    console.log('   5. Fallback ke kode atau kategori');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the function
testProductNames(); 