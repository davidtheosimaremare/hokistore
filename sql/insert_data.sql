-- ==============================================
-- INSERT SAMPLE DATA
-- ==============================================
-- Run this AFTER running supabase_safe.sql

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, full_name, role) 
VALUES (
  'admin@hokiindo.com', 
  '$2b$10$rOzJq3gJY.N7VQF5FQABKeqYqQ4d.u9WgS4QTlG1ZKXM6v4jKX/tG',
  'Super Administrator',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Siemens Industrial Automation', 'siemens-industrial-automation', 'Complete range of Siemens industrial automation products'),
('PLCs & Controllers', 'plcs-controllers', 'Programmable Logic Controllers and automation controllers'),
('HMI & Displays', 'hmi-displays', 'Human Machine Interface and industrial displays'),
('Motor Drives & Starters', 'motor-drives-starters', 'Motor control and drive systems'),
('Safety Systems', 'safety-systems', 'Industrial safety and protection systems'),
('Power Distribution', 'power-distribution', 'Electrical power distribution equipment')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products (run one by one to avoid duplicates)
INSERT INTO products (name, description, price, stock_quantity, category, brand, model, specifications, status, is_featured) 
SELECT 
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
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'SIMATIC S7-1200 CPU 1214C');

INSERT INTO products (name, description, price, stock_quantity, category, brand, model, specifications, status, is_featured) 
SELECT 
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
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'SIMATIC HMI KTP700 Basic');

INSERT INTO products (name, description, price, stock_quantity, category, brand, model, specifications, status, is_featured) 
SELECT 
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
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'SINAMICS G120C Variable Frequency Drive');

INSERT INTO products (name, description, price, stock_quantity, category, brand, model, specifications, status, is_featured) 
SELECT 
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
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'SIMATIC LOGO! 8 Logic Module');

INSERT INTO products (name, description, price, stock_quantity, category, brand, model, specifications, status, is_featured) 
SELECT 
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
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'SITOP PSU100C Power Supply'); 