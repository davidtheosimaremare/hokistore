# 🚀 Setup Guide - Hokiindo Raya Admin dengan Supabase

## Step 1: Setup Database di Supabase

### 1.1 Login ke Supabase
- Buka https://app.supabase.com
- Login dengan akun Anda
- Pilih project Hokiindo yang sudah ada

### 1.2 Jalankan SQL Script
1. **Buka SQL Editor**
   - Di dashboard Supabase, klik **"SQL Editor"** di sidebar kiri
   - Klik **"New Query"**

2. **Step 1: Buat Tables**
   - Copy seluruh isi dari file `sql/supabase_safe.sql`
   - Paste ke SQL Editor
   - Klik **"RUN"** untuk execute

3. **Step 2: Insert Sample Data**
   - Copy seluruh isi dari file `sql/insert_data.sql`
   - Paste ke SQL Editor (query baru)
   - Klik **"RUN"** untuk execute

4. **Verify Setup**
   - Cek tab **"Table Editor"** untuk memastikan tables sudah dibuat:
     - ✅ admin_users
     - ✅ products  
     - ✅ categories
     - ✅ accurate_sync_logs

## Step 2: Test Admin Login

### 2.1 Start Development Server
```bash
npm run dev
```

### 2.2 Access Admin Panel
- Buka browser: `http://localhost:3000/admin/login`
- **Default Credentials:**
  - Email: `admin@hokiindo.com`
  - Password: `admin123`

### 2.3 Verify Dashboard
- Setelah login berhasil, Anda akan diarahkan ke dashboard
- Check semua sections berfungsi normal

## Step 3: Test Accurate Integration

### 3.1 Test Connection
1. Di dashboard admin, scroll ke section **"Accurate Integration"**
2. Klik tombol **"Test Koneksi"**
3. Hasilnya harus menunjukkan: "Koneksi berhasil. Ditemukan X produk di database."

### 3.2 Test Sync Products
1. Klik tombol **"Sinkronisasi Produk"**
2. Monitor progress bar dan statistics
3. Verify bahwa products berhasil di-sync

## Step 4: Verify Data

### 4.1 Check Products Table
1. Di Supabase dashboard, buka **"Table Editor"**
2. Klik table **"products"**
3. Pastikan ada sample products yang sudah di-insert

### 4.2 Check Admin Users
1. Buka table **"admin_users"**
2. Pastikan ada user admin default
3. Password sudah ter-hash dengan bcrypt

## Troubleshooting

### ❌ Error: "permission denied to set parameter"
**Solution**: Gunakan file `sql/supabase_simplified.sql` yang sudah diperbaiki.

### ❌ Error: "Cannot find module '@supabase/supabase-js'"
**Solution**: 
```bash
npm install @supabase/supabase-js
```

### ❌ Error: "Cannot find module 'bcryptjs'"
**Solution**:
```bash
npm install bcryptjs @types/bcryptjs
```

### ❌ Login gagal dengan credentials benar
**Solution**: 
1. Check tabel admin_users di Supabase
2. Pastikan user sudah ter-insert dengan benar
3. Verify password hash

### ❌ Sync products gagal
**Solution**:
1. Check network connection
2. Verify Supabase credentials di `src/lib/supabase.ts`
3. Check browser console untuk error details

## Features yang Sudah Siap

### ✅ Authentication
- [x] Login/logout system
- [x] Session management (24 hours)
- [x] Password hashing dengan bcrypt
- [x] Role-based access

### ✅ Database Integration
- [x] Supabase client configuration
- [x] Admin users table
- [x] Products table dengan Accurate fields
- [x] Categories management
- [x] Sync logs tracking

### ✅ Admin Dashboard
- [x] Statistics overview
- [x] Recent orders display
- [x] Quick actions menu
- [x] Navigation to all sections

### ✅ Accurate Integration (Mock)
- [x] API endpoint `/api/accurate/products`
- [x] Sync interface component
- [x] Progress tracking
- [x] Error handling

## Next Steps untuk Production

### 1. Real Accurate Integration
Ganti mock data di `src/app/api/accurate/products/route.ts` dengan:
```javascript
// Replace fetchAccurateProducts() function dengan real API call
const response = await fetch('https://accurate-api-endpoint', {
  headers: {
    'Authorization': 'Bearer ' + accurateToken,
    'Content-Type': 'application/json'
  }
});
```

### 2. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxedaynwrzqojlrpqzdz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ACCURATE_API_URL=https://accurate-api-url
ACCURATE_API_TOKEN=your_accurate_token
```

### 3. Security Enhancements
- [ ] Implement JWT tokens untuk session
- [ ] Add rate limiting
- [ ] Setup CORS properly
- [ ] Implement audit logging

### 4. Additional Features
- [ ] Product image upload
- [ ] Advanced reporting
- [ ] Email notifications
- [ ] Backup & restore

## Support

Jika ada issue atau pertanyaan:
1. Check troubleshooting section di atas
2. Verify semua dependencies ter-install
3. Check browser console untuk error details
4. Verify Supabase connection dan permissions

---

**🎉 Setup selesai! Admin panel Hokiindo Raya dengan Supabase integration sudah siap digunakan.** 