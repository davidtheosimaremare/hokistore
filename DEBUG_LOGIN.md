# 🔍 Debug Login Issues - Hokiindo Admin

## Problem: Data sudah masuk ke Supabase tapi login masih salah

### 🕵️ Langkah Debug

#### 1. Verify Data di Supabase
1. Login ke Supabase Dashboard
2. Buka **Table Editor** → **admin_users**
3. Check apakah ada record dengan:
   - email: `admin@hokiindo.com`
   - is_active: `true`
   - password_hash: ada isinya

#### 2. Test Password Hash
1. Start development server: `npm run dev`
2. Buka browser: `http://localhost:3000/api/generate-hash`
3. Check apakah hash yang di-generate sama dengan yang di database

#### 3. Check Browser Console
1. Buka `http://localhost:3000/admin/login`
2. Buka **Developer Tools** (F12) → **Console**
3. Coba login dengan `admin@hokiindo.com` / `admin123`
4. Lihat error message di console

### 🔧 Kemungkinan Penyebab & Solusi

#### **Penyebab 1: Password Hash Tidak Valid**
**Gejala**: Console menunjukkan "bcrypt verification failed"

**Solusi**: Update password hash di database
```sql
-- Jalankan di Supabase SQL Editor
UPDATE admin_users 
SET password_hash = '$2b$10$hash_yang_baru_generated'
WHERE email = 'admin@hokiindo.com';
```

#### **Penyebab 2: User Not Found**
**Gejala**: Error "Email atau password tidak valid" 

**Solusi**: Check data di database
```sql
-- Jalankan di Supabase SQL Editor
SELECT * FROM admin_users WHERE email = 'admin@hokiindo.com';
```

#### **Penyebab 3: Supabase Connection Error**
**Gejala**: Console menunjukkan network error atau 500 error

**Solusi**: 
1. Check credentials di `src/lib/supabase.ts`
2. Verify RLS policies di Supabase
3. Check Supabase project status

#### **Penyebab 4: bcryptjs Module Issue**
**Gejala**: Error "Cannot find module bcryptjs"

**Solusi**:
```bash
npm install bcryptjs @types/bcryptjs
```

### 🧪 Quick Tests

#### Test 1: Generate New Hash
```bash
# Buka browser
http://localhost:3000/api/generate-hash

# Ambil hash yang di-generate, update di database
```

#### Test 2: Manual Password Verification
```javascript
// Buka browser console di /admin/login
// Paste code ini:
fetch('/api/generate-hash', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'admin123' })
})
.then(res => res.json())
.then(data => console.log('Hash test:', data));
```

#### Test 3: Check Supabase Connection
```javascript
// Buka browser console
// Paste code ini untuk test connection:
fetch('/api/accurate/products')
.then(res => res.json())
.then(data => console.log('Supabase connection:', data));
```

### 🛠️ Manual Fix Steps

#### Option 1: Reset Password Hash
1. **Generate new hash**:
   ```bash
   # Buka: http://localhost:3000/api/generate-hash
   # Copy hash yang di-generate
   ```

2. **Update database**:
   ```sql
   UPDATE admin_users 
   SET password_hash = 'paste_hash_baru_disini'
   WHERE email = 'admin@hokiindo.com';
   ```

#### Option 2: Recreate Admin User
```sql
-- Delete existing user
DELETE FROM admin_users WHERE email = 'admin@hokiindo.com';

-- Insert with new hash (generated dari API)
INSERT INTO admin_users (email, password_hash, full_name, role) 
VALUES (
  'admin@hokiindo.com', 
  'paste_hash_baru_disini',
  'Super Administrator',
  'super_admin'
);
```

#### Option 3: Simple Test User
```sql
-- Create test user dengan password sederhana
INSERT INTO admin_users (email, password_hash, full_name, role) 
VALUES (
  'test@hokiindo.com', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
  'Test Admin',
  'admin'
);
```

### 🎯 Expected Results

#### ✅ Successful Login Should Show:
```javascript
// Browser console output:
Attempting login with: {email: "admin@hokiindo.com", password: "***"}
Login result: {
  success: true,
  user: {
    id: "uuid-here",
    email: "admin@hokiindo.com",
    full_name: "Super Administrator",
    role: "super_admin"
  }
}
```

#### ❌ Failed Login Common Errors:
```javascript
// Database fetch error:
Login result: {
  success: false,
  error: "Email atau password tidak valid"
}

// Password verification failed:
// Check browser console for bcrypt errors
```

### 📞 Next Steps

1. **Try the debug APIs** I created:
   - `/api/generate-hash` - Generate correct password hash
   - Check browser console during login

2. **Update database** with correct hash if needed

3. **Report back** dengan hasil dari console log

4. **Alternative**: Gunakan test user dengan password "password"

Coba langkah-langkah di atas dan beritahu saya hasil dari browser console ketika login! 🔍 