# 🔐 Admin Panel Setup Guide

Panduan lengkap untuk mengatur admin panel Hokistore dengan Supabase Authentication.

## 📋 Prerequisites

Sebelum memulai, pastikan Anda memiliki:

- ✅ Akun Supabase dengan project yang sudah dibuat
- ✅ Supabase URL dan API keys
- ✅ Node.js dan npm terinstall

## 🚀 Quick Setup

### 1. Environment Variables

Buat file `.env.local` di root project dengan konfigurasi berikut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Cara mendapatkan keys:**
1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Ke Settings → API
4. Copy URL, anon key, dan service_role key

### 2. Database Setup

**Option A: Menggunakan Supabase Dashboard (Recommended)**
1. Buka Supabase Dashboard → SQL Editor
2. Copy-paste isi file `sql/setup_admin.sql`
3. Klik Run untuk menjalankan script

**Option B: Menggunakan Supabase CLI**
```bash
# Install Supabase CLI jika belum ada
npm install -g supabase

# Login ke Supabase
supabase login

# Link project
supabase link --project-ref your-project-id

# Run migration
supabase db push
```

### 3. Create Admin User

**Otomatis (Recommended):**
```bash
# Check konfigurasi Supabase
npm run admin:check

# Buat admin user
npm run admin:create

# Atau jalankan semuanya sekaligus
npm run admin:setup
```

**Manual melalui Supabase Dashboard:**
1. Buka Authentication → Users
2. Klik "Add user"
3. Email: `admin@gmail.com`
4. Password: `12345678`
5. Centang "Auto confirm user"
6. Klik Create

Kemudian jalankan query SQL berikut di SQL Editor:
```sql
-- Ganti USER_ID dengan ID user yang baru dibuat
INSERT INTO public.users (id, email, name, role) 
VALUES (
    'USER_ID_DARI_AUTH_USERS',
    'admin@gmail.com',
    'Administrator',
    'super_admin'
) ON CONFLICT (id) DO UPDATE SET 
    role = 'super_admin',
    name = 'Administrator';
```

### 4. Test Admin Panel

```bash
# Start development server
npm run dev

# Buka admin panel
open http://localhost:3000/admin/login
```

**Login Credentials:**
- Email: `admin@gmail.com`
- Password: `12345678`

## 🔧 Configuration Details

### User Roles

Admin panel mendukung 3 level user:

- **`super_admin`**: Akses penuh ke semua fitur
- **`admin`**: Akses ke sebagian besar fitur (tidak bisa manage users)
- **`editor`**: Akses terbatas ke konten management

### Admin Panel Features

- 📊 **Dashboard**: Overview statistik dan metrics
- 📦 **Products**: Manajemen produk dan inventory
- 🛒 **Orders**: Manajemen transaksi dan pesanan
- 👥 **Users**: Manajemen user (super_admin only)
- 📝 **Blog**: Content management system
- 💼 **Careers**: Job posting management
- 🏗️ **Projects**: Portfolio management
- ⚙️ **Settings**: Konfigurasi sistem

### Database Schema

Tabel `public.users`:
```sql
- id (UUID): Primary key, matches auth.users.id
- email (VARCHAR): User email
- name (VARCHAR): Display name
- role (VARCHAR): User role (customer/editor/admin/super_admin)
- created_at (TIMESTAMP): Record creation time
- updated_at (TIMESTAMP): Last update time
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Otomatis aktif
- **Role-based Access Control**: Pembatasan akses berdasarkan role
- **Auto Profile Creation**: Profile user otomatis dibuat saat signup
- **Secure Authentication**: Menggunakan Supabase Auth

## 🛠️ Troubleshooting

### Common Issues

**❌ "relation public.users does not exist"**
```bash
# Jalankan setup database
npm run admin:check
# Follow instruksi untuk run SQL script
```

**❌ "Email atau password salah"**
```bash
# Check apakah user sudah dibuat
npm run admin:check
# Jika belum ada, buat user admin
npm run admin:create
```

**❌ "Anda tidak memiliki akses ke admin panel"**
- User sudah dibuat di auth.users tapi belum ada di public.users
- Atau role di public.users bukan admin/super_admin
- Check dengan query: `SELECT * FROM public.users WHERE email = 'admin@gmail.com'`

**❌ Environment variables tidak terdeteksi**
- Pastikan file `.env.local` ada di root folder
- Restart development server setelah menambah env variables
- Check dengan: `npm run admin:check`

### Debug Commands

```bash
# Check environment dan koneksi Supabase
npm run admin:check

# Lihat log aplikasi
npm run dev

# Check database tables melalui Supabase Dashboard
# Dashboard → Table Editor → users
```

## 📝 Maintenance

### Mengubah Password Admin

**Via Supabase Dashboard:**
1. Authentication → Users
2. Cari user admin@gmail.com
3. Klik "..." → Reset Password
4. Set password baru

**Via SQL:**
```sql
-- Update password hash (gunakan dengan hati-hati)
UPDATE auth.users 
SET encrypted_password = crypt('new_password', gen_salt('bf'))
WHERE email = 'admin@gmail.com';
```

### Menambah Admin Baru

```sql
-- Setelah user register/dibuat via dashboard
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'email@example.com';
```

### Backup Important Data

```sql
-- Export user roles
SELECT id, email, name, role FROM public.users WHERE role IN ('admin', 'super_admin');

-- Export all admin data
SELECT * FROM public.users WHERE role IN ('admin', 'super_admin', 'editor');
```

## 🔗 Related Files

- `/src/app/admin/layout.tsx` - Admin panel layout
- `/src/app/admin/login/page.tsx` - Admin login page
- `/sql/setup_admin.sql` - Database setup script
- `/scripts/create-admin.js` - Admin user creation script
- `/scripts/check-supabase.js` - Configuration checker

## 🆘 Support

Jika mengalami masalah, cek:

1. 📚 [Supabase Documentation](https://supabase.com/docs)
2. 🐛 [GitHub Issues](https://github.com/your-repo/issues)
3. 💬 Contact developer team

---

🎉 **Admin panel setup complete!** Anda sekarang dapat mengakses admin panel di `/admin/login`. 