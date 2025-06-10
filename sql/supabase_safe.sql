-- ==============================================
-- HOKIINDO RAYA - SUPABASE SETUP (SAFE VERSION)
-- ==============================================
-- Run this script in Supabase SQL Editor
-- Safe version without complex SQL constructs

-- ==============================================
-- 1. ADMIN USERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'staff' CHECK (role IN ('super_admin', 'admin', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- ==============================================
-- 2. PRODUCTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accurate_id VARCHAR(100) UNIQUE,
  accurate_code VARCHAR(100),
  name VARCHAR(500) NOT NULL,
  description TEXT,
  short_description VARCHAR(1000),
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(15,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'pcs',
  category VARCHAR(255) NOT NULL,
  subcategory VARCHAR(255),
  brand VARCHAR(255),
  model VARCHAR(255),
  specifications JSONB DEFAULT '{}',
  features TEXT[],
  images TEXT[] DEFAULT '{}',
  thumbnail VARCHAR(500),
  slug VARCHAR(500) UNIQUE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued', 'out_of_stock')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_accurate TIMESTAMP WITH TIME ZONE
);

-- ==============================================
-- 3. CATEGORIES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  image_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 4. SYNC LOGS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS accurate_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  sync_details JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_by UUID REFERENCES admin_users(id)
);

-- ==============================================
-- 5. INDEXES FOR PERFORMANCE
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_products_accurate_id ON products(accurate_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug); 