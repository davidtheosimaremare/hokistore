# Setup Sistem Alamat dan Checkout

## 1. Setup Database Supabase

### Buat Tabel Alamat
```sql
-- Create user_addresses table
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL, -- 'Rumah', 'Kantor', 'Gudang', etc.
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Buat Tabel Orders
```sql
-- Create orders table
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
```

### Buat Tabel Order Items
```sql
-- Create order_items table
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
```

### Setup RLS (Row Level Security)
```sql
-- Enable RLS
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies untuk user_addresses
CREATE POLICY "Users can manage own addresses" ON public.user_addresses
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies untuk orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies untuk order_items
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );
```

### Trigger untuk Default Address
```sql
-- Function untuk ensure single default address
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.user_addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER ensure_single_default_address
  BEFORE INSERT OR UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE PROCEDURE public.ensure_single_default_address();
```

## 2. Setup Environment Variables

Buat file `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Install Dependencies

```bash
npm install @supabase/supabase-js
```

## 4. Fitur yang Tersedia

### ✅ Authentication Check
- Redirect ke login jika belum login
- Proteksi halaman checkout

### ✅ Multiple Address Management
- User bisa punya banyak alamat
- CRUD alamat (Create, Read, Update, Delete)
- Set default address
- Pilih alamat saat checkout

### ✅ Address Features
- Label alamat (Rumah, Kantor, dll)
- Nama penerima berbeda
- Multiple phone numbers
- Edit/Delete alamat
- Default address management

### ✅ Order Management
- Save order ke database
- Order number auto-generated
- Status tracking
- Shipping address snapshot

## 5. Flow Checkout

1. **User buka `/checkout`**
2. **Check login** - redirect ke `/login` jika belum
3. **Load addresses** - tampilkan alamat yang ada
4. **Pilih alamat** - user pilih dari dropdown
5. **Tambah alamat baru** - jika perlu alamat baru
6. **Submit order** - simpan ke database
7. **Konfirmasi** - tampilkan order number

## 6. Halaman yang Terlibat

- `/checkout` - Halaman checkout dengan address selection
- `/login` - Login page dengan redirect
- Supabase service functions
- Address management components

## 7. Testing

1. **Test Login Check**:
   - Buka `/checkout` tanpa login
   - Harus redirect ke `/login?redirect=/checkout`

2. **Test Address Management**:
   - Login user
   - Tambah alamat baru
   - Edit alamat existing
   - Set default address
   - Delete alamat

3. **Test Checkout**:
   - Pilih alamat
   - Submit order
   - Check database untuk order baru

## 8. Database Structure

### user_addresses
- Multiple alamat per user
- Default address flag
- Complete address info

### orders
- Order master table
- Shipping address snapshot (JSONB)
- Status fields

### order_items
- Order detail items
- Product snapshot

## 9. Security

- ✅ RLS enabled
- ✅ User isolation
- ✅ Proper authentication check
- ✅ Input validation

## 10. Next Steps

Setelah setup basic ini, Anda bisa tambahkan:
- Admin dashboard untuk orders
- Email notifications
- Payment integration
- Shipping tracking
- Order status updates 