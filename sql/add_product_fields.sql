-- ==============================================
-- ADD NEW FIELDS TO PRODUCTS TABLE
-- ==============================================
-- Jalankan script ini di Supabase SQL Editor untuk menambahkan field baru

-- Tambahkan field untuk status publikasi dan manajemen gambar
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_available_online BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Tambahkan field untuk gambar manual (yang diupload sendiri)
-- Pisahkan antara thumbnail dan slide gallery
ALTER TABLE products ADD COLUMN IF NOT EXISTS admin_thumbnail VARCHAR(500); -- Maksimal 1 gambar thumbnail
ALTER TABLE products ADD COLUMN IF NOT EXISTS admin_slide_images TEXT[] DEFAULT '{}'; -- Multiple gambar untuk slide/gallery

-- Hapus field lama jika ada (rename untuk konsistensi)
ALTER TABLE products DROP COLUMN IF EXISTS manual_images;
ALTER TABLE products DROP COLUMN IF EXISTS manual_thumbnail;

-- Tambahkan field SEO
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];

-- Tambahkan index untuk performa
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_products_available_online ON products(is_available_online) WHERE is_available_online = true;
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);
CREATE INDEX IF NOT EXISTS idx_products_admin_thumbnail ON products(admin_thumbnail) WHERE admin_thumbnail IS NOT NULL;

-- Tambahkan comment untuk dokumentasi
COMMENT ON COLUMN products.is_published IS 'Apakah produk ditampilkan di website (true = tayang, false = tidak tayang)';
COMMENT ON COLUMN products.is_available_online IS 'Apakah produk tersedia untuk dibeli online';
COMMENT ON COLUMN products.display_order IS 'Urutan tampilan produk (semakin kecil semakin atas)';
COMMENT ON COLUMN products.admin_thumbnail IS 'URL thumbnail produk yang diupload admin (maksimal 1 gambar)';
COMMENT ON COLUMN products.admin_slide_images IS 'Array URL gambar slide/gallery yang diupload admin (bisa multiple)';
COMMENT ON COLUMN products.seo_title IS 'Judul SEO untuk halaman produk';
COMMENT ON COLUMN products.seo_description IS 'Deskripsi SEO untuk halaman produk';
COMMENT ON COLUMN products.seo_keywords IS 'Kata kunci SEO untuk halaman produk';

-- Update existing products: set status default
UPDATE products SET 
  is_published = false,
  is_available_online = true,
  display_order = 0
WHERE is_published IS NULL; 