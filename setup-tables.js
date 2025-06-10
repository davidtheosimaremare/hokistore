const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  'https://xxedaynwrzqojlrpqzdz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODc0NTQxOSwiZXhwIjoyMDY0MzIxNDE5fQ.TBmLv-Loor7iwXjfHi_duVRqiZEjY6RMgwVMEubgqyo'
);

async function setupMissingTables() {
  console.log('Setting up missing database tables...');
  
  try {
    // Create orders table
    console.log('\n1. Creating orders table...');
    const { error: orderError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.orders (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          order_number TEXT UNIQUE NOT NULL,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          shipping_address JSONB NOT NULL,
          subtotal DECIMAL(12,2) NOT NULL,
          shipping_cost DECIMAL(12,2) DEFAULT 0,
          total_amount DECIMAL(12,2) NOT NULL,
          status TEXT DEFAULT 'pending',
          payment_status TEXT DEFAULT 'pending',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (orderError) {
      console.log('❌ Orders table error:', orderError.message);
    } else {
      console.log('✅ Orders table created/verified');
    }
    
    // Create order_items table
    console.log('\n2. Creating order_items table...');
    const { error: itemError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.order_items (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          product_price DECIMAL(12,2) NOT NULL,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          unit_price DECIMAL(12,2) NOT NULL,
          total_price DECIMAL(12,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (itemError) {
      console.log('❌ Order items table error:', itemError.message);
    } else {
      console.log('✅ Order items table created/verified');
    }
    
    // Set up RLS policies
    console.log('\n3. Setting up RLS policies...');
    
    // Enable RLS
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;'
    });
    
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;'
    });
    
    // Create policies for orders
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users can view own orders" ON public.orders
        FOR SELECT USING (auth.uid() = user_id);
      `
    });
    
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users can create own orders" ON public.orders
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });
    
    // Create policies for order_items
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users can view own order items" ON public.order_items
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
          )
        );
      `
    });
    
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users can create order items for own orders" ON public.order_items
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
          )
        );
      `
    });
    
    console.log('✅ RLS policies created/verified');
    
    // Create indexes
    console.log('\n4. Creating indexes...');
    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);'
    });
    
    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);'
    });
    
    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);'
    });
    
    console.log('✅ Indexes created/verified');
    
    console.log('\n✅ Database setup completed successfully!');
    
  } catch (err) {
    console.error('❌ Error setting up database:', err.message);
  }
}

setupMissingTables(); 