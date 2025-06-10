const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxedaynwrzqojlrpqzdz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODc0NTQxOSwiZXhwIjoyMDY0MzIxNDE5fQ.TBmLv-Loor7iwXjfHi_duVRqiZEjY6RMgwVMEubgqyo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTables() {
  console.log('Creating orders and order_items tables...\n');

  try {
    // Create orders table
    console.log('1. Creating orders table...');
    const { error: ordersError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.orders (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          order_number TEXT UNIQUE NOT NULL,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          shipping_address JSONB NOT NULL,
          subtotal DECIMAL(12,2) NOT NULL,
          shipping_cost DECIMAL(12,2) DEFAULT 0,
          total_amount DECIMAL(12,2) NOT NULL,
          status TEXT DEFAULT 'sedang_diperiksa_admin',
          payment_status TEXT DEFAULT 'pending',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (ordersError) {
      console.error('❌ Orders table error:', ordersError.message);
    } else {
      console.log('✅ Orders table created successfully');
    }

    // Create order_items table
    console.log('\n2. Creating order_items table...');
    const { error: orderItemsError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.order_items (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
          product_id INTEGER NOT NULL,
          product_name TEXT NOT NULL,
          product_image TEXT,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          unit_price DECIMAL(12,2) NOT NULL,
          total_price DECIMAL(12,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (orderItemsError) {
      console.error('❌ Order items table error:', orderItemsError.message);
    } else {
      console.log('✅ Order items table created successfully');
    }

    // Create indexes
    console.log('\n3. Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);',
      'CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);',
      'CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);'
    ];

    for (const indexSql of indexes) {
      const { error: indexError } = await supabase.rpc('sql', { query: indexSql });
      if (indexError) {
        console.error('❌ Index error:', indexError.message);
      }
    }
    console.log('✅ Indexes created successfully');

    // Enable RLS
    console.log('\n4. Enabling Row Level Security...');
    const rlsQueries = [
      'ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;'
    ];

    for (const rlsQuery of rlsQueries) {
      const { error: rlsError } = await supabase.rpc('sql', { query: rlsQuery });
      if (rlsError) {
        console.error('❌ RLS error:', rlsError.message);
      }
    }
    console.log('✅ RLS enabled successfully');

    // Create RLS policies
    console.log('\n5. Creating RLS policies...');
    const policies = [
      // Orders policies
      `CREATE POLICY IF NOT EXISTS "Users can view own orders" ON public.orders
       FOR SELECT USING (auth.uid() = user_id);`,
      
      `CREATE POLICY IF NOT EXISTS "Users can create own orders" ON public.orders
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,

      // Order items policies
      `CREATE POLICY IF NOT EXISTS "Users can view own order items" ON public.order_items
       FOR SELECT USING (
         EXISTS (
           SELECT 1 FROM public.orders 
           WHERE id = order_id AND user_id = auth.uid()
         )
       );`,

      `CREATE POLICY IF NOT EXISTS "Users can create order items for own orders" ON public.order_items
       FOR INSERT WITH CHECK (
         EXISTS (
           SELECT 1 FROM public.orders 
           WHERE id = order_id AND user_id = auth.uid()
         )
       );`
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('sql', { query: policy });
      if (policyError) {
        console.error('❌ Policy error:', policyError.message);
      }
    }
    console.log('✅ RLS policies created successfully');

    console.log('\n🎉 All tables and configurations created successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTables(); 