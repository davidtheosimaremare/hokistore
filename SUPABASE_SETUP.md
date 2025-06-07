# Setup Supabase Authentication

## Yang Dibutuhkan

Untuk mengaktifkan sistem login/register dengan Supabase, Anda perlu:

### 1. Buat Project Supabase
1. Kunjungi [supabase.com](https://supabase.com)
2. Buat akun dan project baru
3. Catat **Project URL** dan **Anon Key** dari Settings > API

### 2. Setup Environment Variables
Buat file `.env.local` di root project dengan:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth (Opsional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Konfigurasi Authentication di Supabase

#### Email Authentication
1. Di Supabase Dashboard, buka **Authentication > Settings**
2. Pastikan **Enable email confirmations** sesuai kebutuhan
3. Set **Site URL** ke `http://localhost:3000` (development) atau domain production

#### Google OAuth (Opsional)
1. Buat project di [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google+ API
3. Buat OAuth 2.0 credentials
4. Di Supabase Dashboard:
   - Buka **Authentication > Settings > Auth Providers**
   - Enable Google provider
   - Masukkan Client ID dan Client Secret dari Google

### 4. Database Setup
Supabase akan otomatis membuat tabel `auth.users` untuk menyimpan data user.

## Fitur yang Tersedia

### ✅ Email & Password Authentication
- Register dengan email/password
- Login dengan email/password
- Email verification (opsional)
- Password reset

### ✅ Google OAuth
- Login dengan Google account
- Otomatis redirect ke dashboard

### ✅ User Management
- Dashboard user dengan profile info
- Logout functionality
- Protected routes

### ✅ UI Components
- Halaman `/auth` untuk login/register
- Halaman `/dashboard` untuk user dashboard
- Header dengan user menu dropdown
- Form validation dan error handling

## Testing

1. Jalankan development server:
```bash
npm run dev
```

2. Buka `http://localhost:3000/auth` untuk test login/register

3. Setelah login, user akan diarahkan ke `/dashboard`

## File yang Dimodifikasi

- `src/lib/supabase.ts` - Konfigurasi Supabase client
- `src/context/AuthContext.tsx` - Context untuk authentication state
- `src/app/auth/page.tsx` - Halaman login/register
- `src/app/dashboard/page.tsx` - Dashboard user
- `src/components/Header.tsx` - Header dengan user menu
- `src/app/ClientWrapper.tsx` - Provider wrapper
- `src/lang/id.js` & `src/lang/en.js` - Translations untuk auth

## Troubleshooting

### Error: Invalid API URL or Key
- Pastikan environment variables sudah benar
- Restart development server setelah menambah .env.local

### Google OAuth tidak bekerja
- Pastikan redirect URI di Google Console sudah benar
- Untuk development: `http://localhost:3000/auth/callback`
- Untuk production: `https://yourdomain.com/auth/callback`

### User tidak redirect setelah login
- Cek console browser untuk error
- Pastikan AuthProvider sudah di-wrap di ClientWrapper 