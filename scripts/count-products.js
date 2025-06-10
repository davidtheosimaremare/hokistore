const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = 'https://xxedaynwrzqojlrpqzdz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDU0MTksImV4cCI6MjA2NDMyMTQxOX0.xyz6BJFSdW-9QvCe1jpjtGPlMzc8DbhboD9JwYXC5kQ'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countProducts() {
  try {
    console.log('🔄 Menghitung jumlah produk di Supabase...');
    console.log('');

    // Count total products
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Error counting products: ${countError.message}`);
    }

    console.log(`📊 TOTAL PRODUK: ${totalCount}`);
    console.log('');

    // Get products by status
    const statusQuery = await supabase
      .from('products')
      .select('status', { count: 'exact' });

    if (statusQuery.error) {
      console.log('⚠️ Tidak dapat mengambil data status produk');
    } else {
      const statusCounts = {};
      statusQuery.data.forEach(product => {
        const status = product.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      console.log('📈 BREAKDOWN PER STATUS:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} produk`);
      });
      console.log('');
    }

    // Get products by category
    const categoryQuery = await supabase
      .from('products')
      .select('category', { count: 'exact' });

    if (categoryQuery.error) {
      console.log('⚠️ Tidak dapat mengambil data kategori produk');
    } else {
      const categoryCounts = {};
      categoryQuery.data.forEach(product => {
        const category = product.category || 'Tidak ada kategori';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      console.log('🏷️ BREAKDOWN PER KATEGORI:');
      const sortedCategories = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10); // Top 10 categories

      sortedCategories.forEach(([category, count]) => {
        console.log(`   ${category}: ${count} produk`);
      });
      
      if (Object.keys(categoryCounts).length > 10) {
        console.log(`   ... dan ${Object.keys(categoryCounts).length - 10} kategori lainnya`);
      }
      console.log('');
    }

    // Check stock status
    const stockQuery = await supabase
      .from('products')
      .select('stock_quantity', { count: 'exact' });

    if (stockQuery.error) {
      console.log('⚠️ Tidak dapat mengambil data stok produk');
    } else {
      let inStock = 0;
      let outOfStock = 0;
      let lowStock = 0;

      stockQuery.data.forEach(product => {
        const stock = parseInt(product.stock_quantity) || 0;
        if (stock === 0) {
          outOfStock++;
        } else if (stock <= 5) {
          lowStock++;
        } else {
          inStock++;
        }
      });

      console.log('📦 STATUS STOK:');
      console.log(`   Stok tersedia (>5): ${inStock} produk`);
      console.log(`   Stok rendah (1-5): ${lowStock} produk`);
      console.log(`   Stok habis (0): ${outOfStock} produk`);
      console.log('');
    }

    console.log('✅ Selesai menghitung produk!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the function
countProducts(); 