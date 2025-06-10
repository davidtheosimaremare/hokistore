-- ======================================
-- DEBUG DAN PERBAIKAN TABEL ORDER_ITEMS  
-- Jalankan di Supabase Dashboard > SQL Editor
-- ======================================

-- 1. Cek apakah tabel order_items sudah ada
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'order_items'
) AS table_exists;

-- 2. Cek struktur tabel saat ini
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'order_items'
ORDER BY ordinal_position;

-- 3. Cek RLS policies untuk order_items
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'order_items';

-- 4. Drop dan recreate tabel jika perlu (HATI-HATI: ini akan hapus data!)
-- Uncomment jika benar-benar diperlukan
/*
DROP TABLE IF EXISTS public.order_items CASCADE;
*/

-- 5. Buat tabel order_items dengan schema yang benar
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items for own orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can update order items for own orders" ON public.order_items;

-- 8. Create RLS policies
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update order items for own orders" ON public.order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- 9. Create indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- 10. Test insert untuk memastikan schema benar
-- Ganti dengan order_id yang valid jika ada
/*
INSERT INTO public.order_items (
  order_id,
  product_id,
  product_name,
  product_image,
  quantity,
  unit_price,
  total_price
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Ganti dengan order_id yang valid
  'test-product-uuid',
  'Test Product',
  'https://example.com/image.jpg',
  1,
  100.00,
  100.00
);
*/

-- 11. Verifikasi schema final
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'order_items'
ORDER BY ordinal_position; 