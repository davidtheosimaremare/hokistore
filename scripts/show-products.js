const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = 'https://xxedaynwrzqojlrpqzdz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDU0MTksImV4cCI6MjA2NDMyMTQxOX0.xyz6BJFSdW-9QvCe1jpjtGPlMzc8DbhboD9JwYXC5kQ'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function formatPrice(price) {
  if (!price) return 'Tidak ada harga';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(price);
}

function formatDate(dateString) {
  if (!dateString) return 'Tidak ada tanggal';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function showProducts() {
  try {
    const args = process.argv.slice(2);
    const page = parseInt(args[0]) || 1;
    const limit = parseInt(args[1]) || 10;
    const searchTerm = args[2] || '';
    const category = args[3] || '';
    const status = args[4] || '';

    console.log('🔍 MENAMPILKAN DATA PRODUK SUPABASE');
    console.log('='.repeat(50));
    console.log('');

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Apply filters
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      console.log(`🔍 Filter pencarian: "${searchTerm}"`);
    }

    if (category) {
      query = query.eq('category', category);
      console.log(`🏷️ Filter kategori: "${category}"`);
    }

    if (status) {
      query = query.eq('status', status);
      console.log(`📊 Filter status: "${status}"`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    console.log(`📊 Total produk: ${count}`);
    console.log(`📄 Halaman: ${page} dari ${Math.ceil(count / limit)}`);
    console.log(`📦 Menampilkan: ${data.length} produk (${from + 1}-${Math.min(to + 1, count)})`);
    console.log('');

    if (!data || data.length === 0) {
      console.log('❌ Tidak ada produk ditemukan');
      return;
    }

    // Display products
    data.forEach((product, index) => {
      console.log(`${(from + index + 1).toString().padStart(3, '0')}. ${product.name || 'Tidak ada nama'}`);
      console.log(`     ID: ${product.id}`);
      console.log(`     Accurate ID: ${product.accurate_id || 'Tidak ada'}`);
      console.log(`     Kategori: ${product.category || 'Tidak ada kategori'}`);
      console.log(`     Brand: ${product.brand || 'Tidak ada brand'}`);
      console.log(`     Model: ${product.model || 'Tidak ada model'}`);
      console.log(`     Harga: ${formatPrice(product.price)}`);
      console.log(`     Harga Cost: ${formatPrice(product.cost_price)}`);
      console.log(`     Stok: ${product.stock_quantity || 0} ${product.unit || 'pcs'}`);
      console.log(`     Status: ${product.status || 'unknown'}`);
      
      if (product.description) {
        console.log(`     Deskripsi: ${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}`);
      }
      
      if (product.specifications) {
        console.log(`     Spesifikasi: ${JSON.stringify(product.specifications).substring(0, 100)}...`);
      }
      
      if (product.images && product.images.length > 0) {
        console.log(`     Gambar: ${product.images.length} gambar`);
      }
      
      console.log(`     Dibuat: ${formatDate(product.created_at)}`);
      console.log(`     Diupdate: ${formatDate(product.updated_at)}`);
      
      if (product.last_sync_accurate) {
        console.log(`     Sync Accurate: ${formatDate(product.last_sync_accurate)}`);
      }
      
      console.log('     ' + '-'.repeat(60));
      console.log('');
    });

    console.log('');
    console.log('💡 CARA PENGGUNAAN:');
    console.log('   node scripts/show-products.js [halaman] [limit] [pencarian] [kategori] [status]');
    console.log('');
    console.log('   Contoh:');
    console.log('   node scripts/show-products.js 2 5              # Halaman 2, 5 produk per halaman');
    console.log('   node scripts/show-products.js 1 10 "motor"     # Cari produk dengan kata "motor"');
    console.log('   node scripts/show-products.js 1 10 "" "ACB"    # Filter kategori ACB');
    console.log('   node scripts/show-products.js 1 10 "" "" "active" # Filter status active');
    console.log('');
    
    if (page < Math.ceil(count / limit)) {
      console.log(`➡️ Untuk halaman selanjutnya: node scripts/show-products.js ${page + 1} ${limit}`);
    }
    
    if (page > 1) {
      console.log(`⬅️ Untuk halaman sebelumnya: node scripts/show-products.js ${page - 1} ${limit}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the function
showProducts(); 