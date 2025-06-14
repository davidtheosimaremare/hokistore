-- HOKISTORE - COMPLETE SUPABASE SETUP
-- =========================================
-- Script lengkap untuk setup database Supabase
-- Melengkapi table profiles yang sudah ada
-- =========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- 1. TABLE USERS (Admin Management)
-- =========================================
-- Table untuk manajemen user admin dengan role-based access
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'editor', 'admin', 'super_admin')),
    phone VARCHAR(20),
    avatar_url TEXT,
    company_name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    country VARCHAR(100) DEFAULT 'Indonesia',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- =========================================
-- 2. TABLE CATEGORIES
-- =========================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- =========================================
-- 3. TABLE PRODUCTS
-- =========================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_number VARCHAR(100) UNIQUE,
    name VARCHAR(500) NOT NULL,
    short_name VARCHAR(255),
    description TEXT,
    brand VARCHAR(100),
    model VARCHAR(100),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price DECIMAL(15, 2),
    stock_quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 1,
    warehouse VARCHAR(100),
    weight DECIMAL(10, 3),
    dimensions JSONB, -- {length, width, height}
    images JSONB, -- Array of image URLs
    specifications JSONB, -- Product specs
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_product_number ON public.products(product_number);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- =========================================
-- 4. TABLE ORDERS
-- =========================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    shipping_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Customer information
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    
    -- Shipping information
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_postal_code VARCHAR(10),
    shipping_country VARCHAR(100) DEFAULT 'Indonesia',
    
    -- Notes
    notes TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    order_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date);

-- =========================================
-- 5. TABLE ORDER ITEMS
-- =========================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(500) NOT NULL,
    product_number VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- =========================================
-- 6. TABLE BLOG POSTS
-- =========================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    tags JSONB, -- Array of tags
    seo_title VARCHAR(255),
    seo_description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    author_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);

-- =========================================
-- 7. TABLE CAREERS
-- =========================================
CREATE TABLE IF NOT EXISTS public.careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100),
    location VARCHAR(100),
    type VARCHAR(50) DEFAULT 'full-time' CHECK (type IN ('full-time', 'part-time', 'contract', 'internship')),
    description TEXT,
    requirements TEXT,
    benefits TEXT,
    salary_range VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
    published_at TIMESTAMP WITH TIME ZONE,
    application_deadline TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_careers_slug ON public.careers(slug);
CREATE INDEX IF NOT EXISTS idx_careers_status ON public.careers(status);

-- =========================================
-- 8. TABLE PROJECTS
-- =========================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    client VARCHAR(255),
    location VARCHAR(255),
    project_type VARCHAR(100),
    year INTEGER,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('planning', 'in-progress', 'completed', 'cancelled')),
    featured_image TEXT,
    images JSONB, -- Array of image URLs
    technologies JSONB, -- Array of technologies
    is_featured BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON public.projects(is_featured);

-- =========================================
-- 9. TABLE SETTINGS
-- =========================================
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    type VARCHAR(50) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json', 'array')),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- =========================================
-- ENABLE RLS ON ALL TABLES
-- =========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLS POLICIES - USERS TABLE
-- =========================================
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admin users can manage all profiles" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

-- Create new policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin users can view all profiles" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Admin users can manage all profiles" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Service role can insert users" ON public.users
    FOR INSERT WITH CHECK (true);

-- =========================================
-- RLS POLICIES - PUBLIC READ ACCESS
-- =========================================

-- Categories - Public can view active categories
CREATE POLICY "Public can view active categories" ON public.categories
    FOR SELECT USING (is_active = true);

-- Products - Public can view active products
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Blog Posts - Public can view published posts
CREATE POLICY "Public can view published blog posts" ON public.blog_posts
    FOR SELECT USING (status = 'published');

-- Careers - Public can view active careers
CREATE POLICY "Public can view active careers" ON public.careers
    FOR SELECT USING (status = 'active');

-- Projects - Public can view projects
CREATE POLICY "Public can view projects" ON public.projects
    FOR SELECT USING (true);

-- Settings - Public can view public settings
CREATE POLICY "Public can view public settings" ON public.settings
    FOR SELECT USING (is_public = true);

-- =========================================
-- RLS POLICIES - ADMIN MANAGEMENT
-- =========================================

-- Admin can manage categories
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Admin can manage products
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Admin can manage orders
CREATE POLICY "Admins can manage orders" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );

-- Admin can manage order items
CREATE POLICY "Admins can manage order items" ON public.order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );

-- Editors can manage blog posts
CREATE POLICY "Editors can manage blog posts" ON public.blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Admin can manage careers
CREATE POLICY "Admins can manage careers" ON public.careers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Editors can manage projects
CREATE POLICY "Editors can manage projects" ON public.projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Admin can manage settings
CREATE POLICY "Admins can manage settings" ON public.settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );

-- =========================================
-- RLS POLICIES - USER ORDERS
-- =========================================

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (user_id = auth.uid());

-- Users can view their own order items
CREATE POLICY "Users can view their own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_items.order_id 
            AND user_id = auth.uid()
        )
    );

-- =========================================
-- FUNCTIONS
-- =========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into users table
    INSERT INTO public.users (id, email, name, role, email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'customer',
        NEW.email_confirmed_at IS NOT NULL
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_order_number TEXT;
    year_month TEXT;
    sequence_num INTEGER;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.orders
    WHERE order_number LIKE 'ORD' || year_month || '%';
    
    new_order_number := 'ORD' || year_month || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Function to set order number before insert
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := public.generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- TRIGGERS
-- =========================================

-- Updated_at triggers for all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_careers_updated_at ON public.careers;
CREATE TRIGGER update_careers_updated_at
    BEFORE UPDATE ON public.careers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auth user creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Order number generation trigger
DROP TRIGGER IF EXISTS set_order_number_trigger ON public.orders;
CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_order_number();

-- =========================================
-- INSERT DEFAULT DATA
-- =========================================

-- Insert default categories
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
('Drive Technology', 'drive-technology', 'Variable frequency drives & motor control', 1),
('Automation Technology', 'automation-technology', 'PLCs, HMIs & industrial automation', 2),
('Low Voltage Control and Distribution', 'low-voltage', 'Switchgear, panels & distribution systems', 3),
('AutoGo Series', 'autogo-series', 'Automotive grade electrical solutions', 4),
('LiteGo Series', 'litego-series', 'Compact & efficient lighting control', 5),
('MateGo Series', 'matego-series', 'Modular automation components', 6),
('Industrial Lighting', 'industrial-lighting', 'LED fixtures & lighting solutions', 7),
('Busduct', 'busduct', 'Power distribution busbar systems', 8)
ON CONFLICT (slug) DO NOTHING;

-- Insert default settings
INSERT INTO public.settings (key, value, description, type, is_public) VALUES
('site_name', '"Hokiindo Raya"', 'Website name', 'string', true),
('site_description', '"Distributor Siemens Terbaik dan Terpercaya"', 'Website description', 'string', true),
('contact_email', '"admin@hokiindo.com"', 'Contact email', 'string', true),
('contact_phone', '"+62 21 1234 5678"', 'Contact phone', 'string', true),
('contact_address', '"Jl. Industri Raya No. 123, Jakarta 12345, Indonesia"', 'Contact address', 'string', true),
('currency', '"IDR"', 'Default currency', 'string', true),
('tax_rate', '11', 'Tax rate percentage', 'number', true),
('free_shipping_threshold', '1000000', 'Free shipping minimum amount', 'number', true),
('admin_emails', '["admin@hokiindo.com"]', 'Admin notification emails', 'array', false),
('maintenance_mode', 'false', 'Maintenance mode toggle', 'boolean', false)
ON CONFLICT (key) DO NOTHING;

-- =========================================
-- VIEWS FOR ADMIN DASHBOARD
-- =========================================

-- Dashboard statistics view
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.users WHERE role != 'customer') as admin_users,
    (SELECT COUNT(*) FROM public.users WHERE role = 'customer') as customers,
    (SELECT COUNT(*) FROM public.products WHERE is_active = true) as active_products,
    (SELECT COUNT(*) FROM public.orders WHERE status != 'cancelled') as total_orders,
    (SELECT COUNT(*) FROM public.orders WHERE status = 'pending') as pending_orders,
    (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status = 'delivered') as total_revenue,
    (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'published') as published_posts,
    (SELECT COUNT(*) FROM public.careers WHERE status = 'active') as active_jobs;

-- Recent orders view
CREATE OR REPLACE VIEW public.recent_orders AS
SELECT 
    o.id,
    o.order_number,
    o.customer_name,
    o.customer_email,
    o.status,
    o.total_amount,
    o.order_date,
    COUNT(oi.id) as item_count
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.customer_name, o.customer_email, o.status, o.total_amount, o.order_date
ORDER BY o.order_date DESC
LIMIT 10;

-- Top products view
CREATE OR REPLACE VIEW public.top_products AS
SELECT 
    p.id,
    p.name,
    p.product_number,
    p.price,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(SUM(oi.total_price), 0) as total_revenue
FROM public.products p
LEFT JOIN public.order_items oi ON p.id = oi.product_id
LEFT JOIN public.orders o ON oi.order_id = o.id AND o.status = 'delivered'
GROUP BY p.id, p.name, p.product_number, p.price
ORDER BY total_sold DESC
LIMIT 10;

-- =========================================
-- COMPLETION MESSAGE
-- =========================================
SELECT 
    'Database setup completed successfully!' as message,
    'Tables: users, categories, products, orders, order_items, blog_posts, careers, projects, settings' as tables_created,
    'All RLS policies, functions, triggers, and views have been set up' as security_setup,
    'Default categories and settings have been inserted' as default_data,
    'Ready for admin panel use!' as status;
