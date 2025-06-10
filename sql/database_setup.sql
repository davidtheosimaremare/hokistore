-- ==============================================
-- HOKIINDO RAYA - SUPABASE DATABASE SETUP
-- ==============================================

-- Note: JWT secret sudah diatur otomatis oleh Supabase
-- Tidak perlu manual setting untuk hosted environment

-- ==============================================
-- ADMIN USERS TABLE
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

-- Insert default admin user
INSERT INTO admin_users (email, password_hash, full_name, role) 
VALUES (
  'admin@hokiindo.com', 
  '$2b$10$rOzJq3gJY.N7VQF5FQABKeqYqQ4d.u9WgS4QTlG1ZKXM6v4jKX/tG', -- password: admin123
  'Super Administrator',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- ==============================================
-- PRODUCTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Accurate Integration
  accurate_id VARCHAR(100) UNIQUE,
  accurate_code VARCHAR(100),
  
  -- Basic Product Info
  name VARCHAR(500) NOT NULL,
  description TEXT,
  short_description VARCHAR(1000),
  
  -- Pricing
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(15,2) DEFAULT 0,
  retail_price DECIMAL(15,2) DEFAULT 0,
  wholesale_price DECIMAL(15,2) DEFAULT 0,
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'pcs',
  
  -- Categorization
  category VARCHAR(255) NOT NULL,
  subcategory VARCHAR(255),
  brand VARCHAR(255),
  model VARCHAR(255),
  series VARCHAR(255),
  
  -- Technical Specifications
  specifications JSONB DEFAULT '{}',
  features TEXT[],
  dimensions VARCHAR(255),
  weight DECIMAL(10,3),
  
  -- Media
  images TEXT[] DEFAULT '{}',
  thumbnail VARCHAR(500),
  brochure_url VARCHAR(500),
  manual_url VARCHAR(500),
  
  -- SEO & Marketing
  slug VARCHAR(500) UNIQUE,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  keywords TEXT[],
  
  -- Status & Visibility
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued', 'out_of_stock')),
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_accurate TIMESTAMP WITH TIME ZONE,
  
  -- Indexing for performance
  CONSTRAINT products_slug_check CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_accurate_id ON products(accurate_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- ==============================================
-- CATEGORIES TABLE
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

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Siemens Industrial Automation', 'siemens-industrial-automation', 'Complete range of Siemens industrial automation products'),
('PLCs & Controllers', 'plcs-controllers', 'Programmable Logic Controllers and automation controllers'),
('HMI & Displays', 'hmi-displays', 'Human Machine Interface and industrial displays'),
('Motor Drives & Starters', 'motor-drives-starters', 'Motor control and drive systems'),
('Safety Systems', 'safety-systems', 'Industrial safety and protection systems'),
('Sensors & Instrumentation', 'sensors-instrumentation', 'Industrial sensors and measurement instruments'),
('Communication & Networks', 'communication-networks', 'Industrial communication and networking solutions'),
('Power Distribution', 'power-distribution', 'Electrical power distribution equipment')
ON CONFLICT (slug) DO NOTHING;

-- ==============================================
-- ACCURATE SYNC LOG TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS accurate_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type VARCHAR(50) NOT NULL, -- 'products', 'inventory', 'prices'
  status VARCHAR(50) NOT NULL, -- 'success', 'error', 'warning'
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
-- PRODUCT PRICE HISTORY TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS product_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price DECIMAL(15,2),
  new_price DECIMAL(15,2) NOT NULL,
  price_type VARCHAR(50) DEFAULT 'retail', -- 'retail', 'wholesale', 'cost'
  change_reason VARCHAR(255),
  changed_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INVENTORY MOVEMENTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) NOT NULL, -- 'in', 'out', 'adjustment', 'sync'
  quantity INTEGER NOT NULL,
  old_stock INTEGER,
  new_stock INTEGER,
  reference_type VARCHAR(50), -- 'order', 'adjustment', 'accurate_sync'
  reference_id VARCHAR(255),
  notes TEXT,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- FUNCTIONS & TRIGGERS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug for products
CREATE OR REPLACE FUNCTION set_product_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = generate_slug(NEW.name);
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM products WHERE slug = NEW.slug AND id != COALESCE(NEW.id, gen_random_uuid())) LOOP
            NEW.slug = NEW.slug || '-' || substring(gen_random_uuid()::text from 1 for 8);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_slug_trigger BEFORE INSERT OR UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_product_slug();

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accurate_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Policies for admin_users (only authenticated admins can access)
CREATE POLICY "Admin users can view all admin accounts" ON admin_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can update admin accounts" ON admin_users FOR UPDATE TO authenticated USING (true);

-- Policies for products (public read, admin write)
CREATE POLICY "Anyone can view active products" ON products FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Admins can manage all products" ON products FOR ALL TO authenticated USING (true);

-- Policies for categories (public read, admin write)
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL TO authenticated USING (true);

-- Policies for logs and history (admin only)
CREATE POLICY "Admins can view sync logs" ON accurate_sync_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can create sync logs" ON accurate_sync_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can view price history" ON product_price_history FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can view inventory movements" ON inventory_movements FOR ALL TO authenticated USING (true);

-- ==============================================
-- SAMPLE DATA
-- ==============================================

-- Insert sample products (Siemens industrial products)
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
)
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- VIEWS FOR REPORTING
-- ==============================================

-- Product summary view
CREATE OR REPLACE VIEW product_summary AS
SELECT 
  p.id,
  p.name,
  p.price,
  p.stock_quantity,
  p.category,
  p.brand,
  p.status,
  p.is_featured,
  p.created_at,
  CASE 
    WHEN p.stock_quantity <= 5 THEN 'Low Stock'
    WHEN p.stock_quantity = 0 THEN 'Out of Stock'
    ELSE 'In Stock'
  END as stock_status
FROM products p
WHERE p.status != 'discontinued';

-- Inventory alerts view
CREATE OR REPLACE VIEW inventory_alerts AS
SELECT 
  p.id,
  p.name,
  p.stock_quantity,
  p.min_stock,
  p.category,
  p.brand,
  'Low Stock' as alert_type,
  p.updated_at
FROM products p
WHERE p.stock_quantity <= p.min_stock 
  AND p.status = 'active'
  AND p.min_stock > 0;

COMMENT ON TABLE admin_users IS 'Admin users for system access';
COMMENT ON TABLE products IS 'Product catalog with Accurate integration';
COMMENT ON TABLE categories IS 'Product categories hierarchy';
COMMENT ON TABLE accurate_sync_logs IS 'Logs for Accurate system synchronization';
COMMENT ON TABLE product_price_history IS 'History of product price changes';
COMMENT ON TABLE inventory_movements IS 'Track all inventory movements'; 