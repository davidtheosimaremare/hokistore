-- ==============================================
-- CHECK PRODUCTS DATA SCRIPT
-- ==============================================
-- Script untuk memeriksa data produk di Supabase
-- Jalankan di Supabase SQL Editor

-- 1. Cek struktur tabel products
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Cek sample data produk (5 teratas)
SELECT 
    id,
    name,
    brand,
    category,
    price,
    stock_quantity,
    status,
    admin_thumbnail,
    is_published,
    created_at
FROM products 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Cek distribusi brand (apakah ada yang NULL atau kosong)
SELECT 
    CASE 
        WHEN brand IS NULL THEN 'NULL'
        WHEN brand = '' THEN 'EMPTY'
        ELSE brand
    END as brand_status,
    COUNT(*) as count
FROM products 
GROUP BY 
    CASE 
        WHEN brand IS NULL THEN 'NULL'
        WHEN brand = '' THEN 'EMPTY'
        ELSE brand
    END
ORDER BY count DESC;

-- 4. Cek total produk dan status
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) as products_with_name,
    COUNT(CASE WHEN brand IS NOT NULL AND brand != '' THEN 1 END) as products_with_brand,
    COUNT(CASE WHEN category IS NOT NULL AND category != '' THEN 1 END) as products_with_category,
    COUNT(CASE WHEN admin_thumbnail IS NOT NULL THEN 1 END) as products_with_admin_thumbnail,
    COUNT(CASE WHEN is_published = true THEN 1 END) as published_products
FROM products;

-- 5. Update brand yang NULL atau kosong menjadi 'Siemens' (uncomment jika diperlukan)
-- UPDATE products 
-- SET brand = 'Siemens' 
-- WHERE brand IS NULL OR brand = '';

-- 6. Update category yang NULL atau kosong menjadi 'Umum' (uncomment jika diperlukan)  
-- UPDATE products 
-- SET category = 'Umum' 
-- WHERE category IS NULL OR category = '';

-- 7. Cek RLS policy yang aktif
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'products';

SELECT 'Products data check completed' as message; 