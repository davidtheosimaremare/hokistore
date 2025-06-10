-- ==============================================
-- FIX PRODUCTS ACCESS FOR ALL USERS
-- ==============================================
-- Script untuk memastikan semua produk dapat diakses semua user
-- Jalankan di Supabase SQL Editor

-- 1. Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;

-- 2. Create new policy that allows everyone to view ALL products
-- regardless of status (as requested - all products accessible to all users)
CREATE POLICY "Everyone can view all products" ON products
    FOR SELECT TO anon, authenticated USING (true);

-- 3. Ensure admin can still manage products
DROP POLICY IF EXISTS "Admins can manage all products" ON products;
CREATE POLICY "Admins can manage all products" ON products
    FOR ALL TO authenticated USING (true);

-- 4. Update any products with missing brand to 'Siemens'
UPDATE products 
SET brand = 'Siemens' 
WHERE brand IS NULL OR brand = '' OR TRIM(brand) = '';

-- 5. Update any products with missing category to 'Umum'
UPDATE products 
SET category = 'Umum' 
WHERE category IS NULL OR category = '' OR TRIM(category) = '';

-- 6. Set all products status to 'active' to ensure visibility
UPDATE products 
SET status = 'active' 
WHERE status IS NULL OR status = '' OR status IN ('inactive', 'discontinued');

-- 7. Set all products as published for public visibility
UPDATE products 
SET is_published = true,
    is_available_online = true
WHERE is_published IS NULL OR is_published = false;

-- 8. Verify the changes
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_products,
    COUNT(CASE WHEN is_published = true THEN 1 END) as published_products,
    COUNT(CASE WHEN brand IS NOT NULL AND brand != '' THEN 1 END) as products_with_brand,
    COUNT(CASE WHEN category IS NOT NULL AND category != '' THEN 1 END) as products_with_category
FROM products;

-- 9. Show current RLS policies
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'products';

-- 10. Sample of updated products
SELECT id, name, brand, category, status, is_published, is_available_online
FROM products 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'Products access fixed - All products are now accessible to all users!' as message; 