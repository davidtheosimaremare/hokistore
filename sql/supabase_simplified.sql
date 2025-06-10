-- ==============================================
-- HOKIINDO RAYA - SUPABASE SETUP (SIMPLIFIED)
-- ==============================================
-- Run this script in Supabase SQL Editor

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

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, full_name, role) 
VALUES (
  'admin@hokiindo.com', 
  '$2b$10$rOzJq3gJY.N7VQF5FQABKeqYqQ4d.u9WgS4QTlG1ZKXM6v4jKX/tG',
  'Super Administrator',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

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
  is_published BOOLEAN DEFAULT false,
  is_available_online BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  admin_thumbnail VARCHAR(500),
  admin_slide_images TEXT[] DEFAULT '{}',
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT[],
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

-- ==============================================
-- 6. INSERT SAMPLE CATEGORIES
-- ==============================================
INSERT INTO categories (name, slug, description) VALUES
('Siemens Industrial Automation', 'siemens-industrial-automation', 'Complete range of Siemens industrial automation products'),
('PLCs & Controllers', 'plcs-controllers', 'Programmable Logic Controllers and automation controllers'),
('HMI & Displays', 'hmi-displays', 'Human Machine Interface and industrial displays'),
('Motor Drives & Starters', 'motor-drives-starters', 'Motor control and drive systems'),
('Safety Systems', 'safety-systems', 'Industrial safety and protection systems'),
('Power Distribution', 'power-distribution', 'Electrical power distribution equipment')
ON CONFLICT (slug) DO NOTHING;

-- ==============================================
-- 7. INSERT SAMPLE PRODUCTS
-- ==============================================
-- Insert sample products (without conflict handling since name is not unique)
DO $$
BEGIN
  -- Only insert if no products exist yet
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    INSERT INTO products (
      name, description, price, stock_quantity, category, brand, model, 
      specifications, status, is_featured
    ) VALUES
    (
      'SIMATIC S7-1200 CPU 1214C',
      'Compact CPU for small to medium automation tasks with integrated I/O',
      15500000,
      25,
      'PLCs & Controllers',
      'Siemens',
      'CPU 1214C DC/DC/DC',
      '{"inputs": 14, "outputs": 10, "memory": "100KB", "ethernet": true}',
      'active',
      true
    ),
    (
      'SIMATIC HMI KTP700 Basic',
      '7" Basic Panel with touch operation and basic HMI functionality',
      12800000,
      15,
      'HMI & Displays',
      'Siemens',
      'KTP700 Basic',
      '{"screen_size": "7 inch", "resolution": "800x480", "colors": "65536"}',
      'active',
      true
    ),
    (
      'SINAMICS G120C Variable Frequency Drive',
      'Compact frequency converter for simple drive tasks',
      8750000,
      30,
      'Motor Drives & Starters',
      'Siemens',
      'G120C',
      '{"power_range": "0.55-7.5kW", "voltage": "380-480V", "protection": "IP20"}',
      'active',
      false
    ),
    (
      'SIMATIC LOGO! 8 Logic Module',
      'Intelligent logic module for basic automation tasks',
      2750000,
      50,
      'PLCs & Controllers',
      'Siemens',
      'LOGO! 8',
      '{"inputs": 8, "outputs": 4, "display": "Built-in", "programming": "LOGO! Soft Comfort"}',
      'active',
      false
    ),
    (
      'SITOP PSU100C Power Supply',
      '24V DC regulated power supply for industrial applications',
      3200000,
      40,
      'Power Distribution',
      'Siemens',
      'PSU100C',
      '{"input_voltage": "100-240V AC", "output_voltage": "24V DC", "output_current": "10A"}',
      'active',
      false
    );
  END IF;
END $$; 