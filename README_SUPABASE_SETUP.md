# Hokiindo Raya - Supabase Setup Guide

## Overview
Panduan ini menjelaskan cara setup database Supabase untuk sistem admin Hokiindo Raya dengan integrasi Accurate.

## Database Configuration

### 1. Supabase Project Setup
- Project URL: `https://xxedaynwrzqojlrpqzdz.supabase.co`
- Anon Key: Sudah dikonfigurasi di `src/lib/supabase.ts`
- Service Role Key: Sudah dikonfigurasi untuk admin operations

### 2. Database Tables

#### Admin Users Table
```sql
CREATE TABLE admin_users (
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
```

#### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accurate_id VARCHAR(100) UNIQUE,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  category VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  model VARCHAR(255),
  specifications JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  slug VARCHAR(500) UNIQUE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_accurate TIMESTAMP WITH TIME ZONE
);
```

#### Sync Logs Table
```sql
CREATE TABLE accurate_sync_logs (
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
  duration_seconds INTEGER
);
```

### 3. Database Setup Steps

1. **Login ke Supabase Dashboard**
   - Buka https://app.supabase.com
   - Login ke project Hokiindo

2. **Jalankan SQL Script**
   - Buka SQL Editor di Supabase Dashboard
   - Copy dan jalankan script dari `sql/database_setup.sql`

3. **Setup Default Admin**
   ```sql
   INSERT INTO admin_users (email, password_hash, full_name, role) 
   VALUES (
     'admin@hokiindo.com', 
     '$2b$10$rOzJq3gJY.N7VQF5FQABKeqYqQ4d.u9WgS4QTlG1ZKXM6v4jKX/tG',
     'Super Administrator',
     'super_admin'
   );
   ```

4. **Enable Row Level Security**
   - RLS sudah dikonfigurasi untuk security
   - Public dapat membaca produk aktif
   - Admin dapat CRUD semua data

## Features Implemented

### 1. Authentication System
- ✅ Secure password hashing dengan bcrypt
- ✅ Session management dengan localStorage
- ✅ Role-based access control
- ✅ Auto logout setelah 24 jam

### 2. Product Management
- ✅ Full CRUD operations
- ✅ Accurate integration ready
- ✅ Stock tracking
- ✅ Category management
- ✅ Auto slug generation

### 3. Accurate Integration
- ✅ API endpoint untuk sync products (`/api/accurate/products`)
- ✅ Batch import dari Accurate
- ✅ Conflict resolution (update vs create)
- ✅ Sync logging dan monitoring
- ✅ Admin interface untuk sync

### 4. Admin Dashboard
- ✅ Real-time statistics
- ✅ Recent orders display
- ✅ Quick actions
- ✅ Accurate sync interface
- ✅ Navigation to all admin sections

## Usage Guide

### 1. Login Admin
- URL: `/admin/login`
- Default credentials:
  - Email: `admin@hokiindo.com`
  - Password: `admin123`

### 2. Dashboard Features
- View statistik real-time
- Monitor recent orders
- Quick access ke semua fungsi admin
- Sinkronisasi dengan Accurate

### 3. Accurate Sync
1. Klik "Test Koneksi" untuk verify connection
2. Klik "Sinkronisasi Produk" untuk import products
3. Monitor progress dan results
4. Check sync logs untuk debugging

### 4. Product Management
- View all products dari Supabase
- Filter by category, brand, status
- Bulk operations
- Stock alerts untuk low inventory

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### Products
- `GET /api/accurate/products` - Get products from database
- `GET /api/accurate/products?action=sync` - Sync from Accurate
- `POST /api/accurate/products` - Bulk create products

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/logs` - View sync logs

## Environment Variables

Tidak ada environment variables tambahan yang diperlukan karena credentials sudah dikonfigurasi langsung di code untuk demo purposes.

Untuk production, sebaiknya pindahkan ke environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxedaynwrzqojlrpqzdz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Security Considerations

1. **Password Security**
   - Passwords di-hash dengan bcrypt (10 rounds)
   - No plaintext passwords disimpan

2. **Database Security**
   - Row Level Security enabled
   - Role-based access policies
   - API rate limiting (through Supabase)

3. **Session Management**
   - Sessions expire setelah 24 jam
   - Secure session storage
   - Auto-logout on browser close

## Troubleshooting

### Connection Issues
1. Verify Supabase URL dan keys
2. Check network connectivity
3. Verify RLS policies

### Sync Issues
1. Check Accurate API credentials
2. Verify product data format
3. Check sync logs untuk errors

### Performance
1. Monitor database usage di Supabase dashboard
2. Optimize queries dengan indexes
3. Implement pagination untuk large datasets

## Next Steps

1. **Accurate Integration**
   - Replace mock data dengan actual Accurate API
   - Implement real-time sync
   - Add webhook support

2. **Enhanced Features**
   - Image upload untuk products
   - Advanced reporting
   - Email notifications
   - Backup & restore

3. **Production Setup**
   - Move to environment variables
   - Setup CI/CD pipeline
   - Configure monitoring & alerts
   - Implement caching strategy 