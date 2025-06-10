# Setup Database Final - Hokistore

## Status Saat Ini
✅ `user_addresses` - Sudah ada dan berfungsi  
❌ `orders` - Belum ada  
❌ `order_items` - Belum ada  
❌ `profiles` - Belum ada (diperlukan untuk AuthContext)

## Langkah Setup Database

### 1. Buka Supabase Dashboard
- Masuk ke https://supabase.com/dashboard
- Pilih project: xxedaynwrzqojlrpqzdz
- Klik "SQL Editor" di sidebar

### 2. Jalankan Script SQL Berikut

```sql
-- 1. Create profiles table (required for AuthContext)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shipping_address JSONB NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(12,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 5. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. Create RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Create RLS Policies for order_items
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- 9. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

### 3. Verifikasi Setup
Jalankan script ini untuk mengecek apakah semua table sudah ada:

```bash
node check-tables.js
```

Harusnya menampilkan:
```
✅ user_addresses - Table exists
✅ orders - Table exists  
✅ order_items - Table exists
✅ profiles - Table exists
```

### 4. Test Alamat di Checkout
1. Pastikan user sudah login
2. Buka halaman `/checkout` 
3. Alamat seharusnya tampil atau menampilkan "Belum Ada Alamat"
4. Bisa menambah alamat baru
5. Bisa memilih alamat untuk checkout

## Troubleshooting

### Jika Alamat Masih Loading
1. Buka Developer Tools (F12)
2. Cek Console log untuk error
3. Pastikan user sudah login dengan benar
4. Cek apakah RLS policy mengizinkan akses

### Jika Error "relation does not exist"
- Table belum dibuat
- Jalankan SQL script di atas di Supabase dashboard

### Jika User Tidak Terautentikasi
- Pastikan login berhasil
- Cek AuthContext dan session storage
- User harus login terlebih dahulu sebelum checkout

## Fitur yang Sudah Berfungsi
✅ Multiple alamat per user  
✅ Set alamat default  
✅ CRUD alamat (Create, Read, Update, Delete)  
✅ Pilih alamat saat checkout  
✅ Simpan order ke database  
✅ Generate nomor pesanan otomatis  
✅ Row Level Security untuk data isolation 