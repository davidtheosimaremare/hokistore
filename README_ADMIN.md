# Admin Panel HokiStore - Setup Guide

## 🚀 Overview

Admin panel modern untuk HokiStore dengan Next.js 14, Supabase, dan HeroUI/NextUI. Fitur lengkap meliputi:

- ✅ **Authentication**: Login dengan Supabase Auth + role-based access
- ✅ **Product Management**: CRUD produk dengan sync Accurate API
- ✅ **User Management**: Role-based user management (super_admin, admin, editor)
- ✅ **Dashboard**: Statistik dan overview realtime
- ✅ **Modern UI**: HeroUI/NextUI dengan dark mode
- ✅ **API Integration**: Sinkronisasi data dari Accurate API

## 📋 Prerequisites

1. **Node.js** versi 18+
2. **Supabase Project** dengan database PostgreSQL
3. **Accurate API** access token untuk product sync

## 🛠️ Installation

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd hokistore
npm install
```

### 2. Environment Setup

Buat file `.env.local` di root project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Accurate API (untuk sync produk)
ACCURATE_API_TOKEN=your_accurate_api_token
ACCURATE_SECRET_KEY=your_accurate_secret_key
```

### 3. Database Setup

Jalankan SQL script berikut di Supabase SQL Editor:

```sql
-- Enable RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table for role management
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  avatar_url TEXT,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  accurate_id TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Uncategorized',
  brand TEXT DEFAULT 'Siemens',
  sku TEXT UNIQUE NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  meta_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table (for dashboard stats)
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  product_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sync_logs table
CREATE TABLE public.sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  sync_type TEXT NOT NULL,
  products_synced INTEGER DEFAULT 0,
  errors JSONB,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'partial_success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Create Super Admin User

1. Daftar user pertama melalui Supabase Auth Dashboard atau aplikasi
2. Update role menjadi `super_admin`:

```sql
UPDATE public.users 
SET role = 'super_admin' 
WHERE email = 'your-admin-email@example.com';
```

## 🔧 Development

```bash
# Start development server
npm run dev

# Open admin panel
http://localhost:3000/admin/login
```

## 📁 Admin Routes

- `/admin/login` - Halaman login admin
- `/admin/dashboard` - Dashboard utama dengan statistik
- `/admin/products` - Manajemen produk + sync Accurate
- `/admin/users` - Manajemen pengguna dan role
- `/admin/orders` - Manajemen transaksi (placeholder)
- `/admin/blog` - Manajemen blog (placeholder)
- `/admin/careers` - Manajemen karir (placeholder)
- `/admin/projects` - Manajemen proyek (placeholder)
- `/admin/settings` - Pengaturan sistem (placeholder)

## 👥 Role Management

### Super Admin
- Akses penuh ke semua fitur
- Dapat mengelola admin dan editor
- Dapat mengubah role pengguna

### Admin
- Akses ke manajemen produk dan transaksi
- Dapat sync data Accurate
- Dapat mengelola editor

### Editor
- Akses terbatas ke konten management
- Dapat melihat dan edit blog/proyek
- Tidak dapat mengubah produk atau user

## 🔄 Accurate API Integration

### Setup
1. Dapatkan API token dari Accurate
2. Set environment variables
3. Gunakan fitur "Sinkron Accurate" di halaman produk

### Endpoint yang Digunakan
- `https://account.accurate.id/api/product/list.do` - List semua produk
- Authentication menggunakan HMAC-SHA256

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables di Vercel dashboard
```

### Environment Variables untuk Production

Di Vercel dashboard, tambahkan:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ACCURATE_API_TOKEN`
- `ACCURATE_SECRET_KEY`

## 🎨 UI Components

Menggunakan **HeroUI** (pengganti NextUI yang deprecated):

- `@nextui-org/react` - Core components
- `@heroui/react` - Updated components
- `tailwindcss` - Styling
- `framer-motion` - Animations

## 🔍 Features Checklist

- [x] Login/Authentication dengan Supabase
- [x] Role-based access control
- [x] Product CRUD operations
- [x] Accurate API synchronization
- [x] User management
- [x] Dashboard dengan statistik
- [x] Dark mode toggle
- [x] Responsive design
- [x] Form validation dengan Zod
- [x] Toast notifications
- [x] Loading states
- [x] Error handling
- [ ] File upload untuk gambar produk
- [ ] Export/Import data
- [ ] Email notifications
- [ ] Advanced reporting
- [ ] Blog management
- [ ] Career management
- [ ] Project gallery

## 🛟 Troubleshooting

### Build Errors
- Pastikan environment variables sudah diset
- Check TypeScript errors di konsol
- Pastikan semua dependencies terinstall

### Supabase Connection Issues
- Verify URL dan API key di `.env.local`
- Check network connectivity
- Ensure RLS policies are correctly set

### Accurate API Issues
- Verify API token masih valid
- Check timezone settings (harus Asia/Jakarta)
- Monitor rate limits

## 📞 Support

Untuk bantuan teknis:
- Email: admin@hokistore.com
- GitHub Issues: [Repository Issues]
- Documentation: [Wiki/Docs Link]

---

**Built with ❤️ using Next.js 14, Supabase, and HeroUI** 