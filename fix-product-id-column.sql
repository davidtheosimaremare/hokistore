-- ======================================
-- SCRIPT SQL UNTUK MENGUBAH PRODUCT_ID KE TEXT
-- Jalankan di Supabase Dashboard > SQL Editor
-- ======================================

-- Cek apakah kolom product_id masih INTEGER
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'order_items'
  AND column_name = 'product_id';

-- Ubah tipe data product_id dari INTEGER ke TEXT
-- HATI-HATI: Ini akan menghapus data yang ada jika ada
ALTER TABLE public.order_items 
ALTER COLUMN product_id TYPE TEXT;

-- Verifikasi perubahan
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'order_items'
  AND column_name = 'product_id';

-- Update index jika perlu
DROP INDEX IF EXISTS idx_order_items_product_id;
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id); 