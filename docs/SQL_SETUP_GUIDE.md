# Panduan Setup SQL Lengkap Supabase

## 📋 Overview

Script `complete_supabase_setup.sql` ini melengkapi table `profiles` yang sudah ada dengan semua table yang diperlukan untuk admin panel Hokistore.

## 🚀 Cara Penggunaan

### 1. Pastikan Table Profiles Sudah Ada
Pastikan Anda sudah menjalankan script table `profiles` sebelumnya:

```sql
-- 1. Buat table profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Buat RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. Jalankan Script Lengkap
1. Buka Supabase Dashboard
2. Pergi ke SQL Editor
3. Copy paste isi file `sql/complete_supabase_setup.sql`
4. Klik **Run**

## 📊 Table yang Dibuat

### 1. **users** - Manajemen Admin & Customer
```sql
- id (UUID, Primary Key)
- email (VARCHAR, Unique)
- name (VARCHAR)
- role ('customer', 'editor', 'admin', 'super_admin')
- phone, avatar_url, company_name
- address, city, postal_code, country
- is_active, email_verified
- last_login, created_at, updated_at
```

### 2. **categories** - Kategori Produk
```sql
- id, name, slug, description
- image_url, parent_id (self-reference)
- sort_order, is_active
- created_at, updated_at
```

### 3. **products** - Data Produk
```sql
- id, product_number, name, short_name
- description, brand, model, category_id
- price, stock_quantity, min_quantity
- warehouse, weight, dimensions (JSONB)
- images (JSONB), specifications (JSONB)
- is_active, is_featured
- seo_title, seo_description
- created_by, updated_by, timestamps
```

### 4. **orders** - Data Pesanan
```sql
- id, order_number, user_id
- status, payment_status
- subtotal, tax_amount, shipping_amount, total_amount
- customer info (name, email, phone)
- shipping address details
- notes, internal_notes
- order_date, confirmed_at, shipped_at, delivered_at
```

### 5. **order_items** - Item Pesanan
```sql
- id, order_id, product_id
- product_name, product_number (historical)
- quantity, unit_price, total_price
```

### 6. **blog_posts** - Blog/Artikel
```sql
- id, title, slug, excerpt, content
- featured_image, status, tags (JSONB)
- seo_title, seo_description
- published_at, author_id
```

### 7. **careers** - Lowongan Kerja
```sql
- id, title, slug, department, location
- type, description, requirements, benefits
- salary_range, status
- published_at, application_deadline
- created_by
```

### 8. **projects** - Portfolio Proyek
```sql
- id, title, slug, description
- client, location, project_type, year
- status, featured_image, images (JSONB)
- technologies (JSONB), is_featured
- created_by
```

### 9. **settings** - Pengaturan Website
```sql
- id, key, value (JSONB), description
- type, is_public
```

## 🔒 Row Level Security (RLS)

### User Access Levels:
- **customer**: Hanya bisa lihat data sendiri
- **editor**: Bisa manage products, categories, blog, careers, projects
- **admin**: Bisa manage semua + orders & users
- **super_admin**: Full access

### Public Access:
- Categories (active only)
- Products (active only)
- Blog posts (published only)
- Careers (active only)
- Projects (all)
- Settings (public only)

## ⚡ Functions & Triggers

### 1. **update_updated_at_column()**
Auto-update timestamp pada semua table saat ada perubahan

### 2. **handle_new_user()**
Auto-create record di table `users` saat user baru register

### 3. **generate_order_number()**
Generate nomor order otomatis (ORD202412-0001)

### 4. **Auto Triggers**
- Updated_at triggers pada semua table
- Auth user creation trigger
- Order number generation trigger

## 📈 Views untuk Dashboard

### 1. **dashboard_stats**
```sql
- admin_users, customers
- active_products, total_orders, pending_orders
- total_revenue, published_posts, active_jobs
```

### 2. **recent_orders**
10 order terbaru dengan item count

### 3. **top_products**
10 produk terlaris berdasarkan quantity sold

## 🎯 Default Data

### Categories Default:
- Drive Technology
- Automation Technology
- Low Voltage Control and Distribution
- AutoGo Series
- LiteGo Series
- MateGo Series
- Industrial Lighting
- Busduct

### Settings Default:
- Site info (name, description, contact)
- Business settings (currency, tax rate)
- System settings (maintenance mode, admin emails)

## ✅ Verifikasi Setup

Setelah running script, cek dengan query ini:

```sql
-- Cek semua table sudah dibuat
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Cek default categories
SELECT name, slug FROM public.categories ORDER BY sort_order;

-- Cek default settings
SELECT key, value, is_public FROM public.settings;

-- Cek dashboard stats
SELECT * FROM public.dashboard_stats;
```

## 🔧 Maintenance

### Update Settings:
```sql
UPDATE public.settings 
SET value = '"New Value"' 
WHERE key = 'site_name';
```

### Add New Category:
```sql
INSERT INTO public.categories (name, slug, description, sort_order)
VALUES ('New Category', 'new-category', 'Description', 10);
```

### Change User Role:
```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

## 🛡️ Security Notes

1. **RLS Policies** melindungi akses data berdasarkan role
2. **Service Role** diperlukan untuk admin user creation
3. **JSONB fields** untuk fleksibilitas data
4. **Indexes** sudah dioptimalkan untuk performa
5. **Foreign Keys** dengan proper CASCADE/SET NULL

## 📞 Support

Jika ada masalah dalam setup, periksa:
1. Apakah extensions sudah aktif
2. Apakah ada conflicts dengan existing tables
3. Apakah RLS policies sudah benar
4. Apakah auth.users accessible

---

**Status**: ✅ Ready for Production  
**Version**: 1.0  
**Last Updated**: December 2024 