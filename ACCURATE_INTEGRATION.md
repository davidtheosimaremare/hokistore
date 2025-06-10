# Accurate API Integration

## Overview

Sistem ini terintegrasi dengan Accurate API untuk sinkronisasi data produk secara real-time. Integrasi ini mendukung:

- **Full Synchronization**: Sinkronisasi semua produk dari Accurate
- **Incremental Sync**: Hanya sinkronisasi produk yang berubah
- **Real-time Webhooks**: Auto-update ketika ada perubahan di Accurate
- **Connection Testing**: Verifikasi koneksi ke Accurate API

## Setup Konfigurasi

### 1. Environment Variables

Tambahkan variabel berikut ke file `.env.local`:

```env
# Accurate API Configuration
ACCURATE_API_URL=https://api.accurate.id
ACCURATE_CLIENT_ID=your_accurate_client_id
ACCURATE_CLIENT_SECRET=your_accurate_client_secret
ACCURATE_COMPANY_ID=your_accurate_company_id

# Webhook Configuration
ACCURATE_WEBHOOK_SECRET=your_webhook_secret_key
ACCURATE_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# Application URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Mendapatkan Kredensial Accurate

1. Login ke Accurate Online
2. Buka **Developer Portal** > **API Management**
3. Buat aplikasi baru dan dapatkan:
   - Client ID
   - Client Secret
   - Company ID

### 3. Database Schema

Jalankan SQL berikut untuk menambahkan kolom yang diperlukan:

```sql
-- Add Accurate integration columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS accurate_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS accurate_item_no TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS accurate_last_modified TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_of_measure TEXT DEFAULT 'pcs';
ALTER TABLE products ADD COLUMN IF NOT EXISTS average_cost DECIMAL(15,2) DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_accurate_id ON products(accurate_id);
CREATE INDEX IF NOT EXISTS idx_products_accurate_modified ON products(accurate_last_modified);

-- Add categories table if not exists
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  accurate_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Penggunaan

### 1. Test Koneksi

Sebelum melakukan sinkronisasi, pastikan koneksi ke Accurate API berhasil:

```javascript
// Melalui Admin Dashboard
// Klik "Test Koneksi" pada halaman Sync

// Atau melalui API
const response = await fetch('/api/accurate/products?action=test-connection');
const result = await response.json();
```

### 2. Sinkronisasi Produk

#### Full Synchronization
```javascript
// Sinkronisasi semua produk (lebih lama)
const response = await fetch('/api/accurate/products?action=sync');
const result = await response.json();
```

#### Incremental Sync
```javascript
// Hanya produk yang berubah sejak sync terakhir
const response = await fetch('/api/accurate/products?action=sync-incremental');
const result = await response.json();
```

### 3. Setup Webhook

Untuk update otomatis ketika ada perubahan di Accurate:

```javascript
// Setup webhook sekali
const response = await fetch('/api/accurate/products?action=setup-webhook');
const result = await response.json();
```

Webhook endpoint: `https://yourdomain.com/api/webhooks/accurate`

## API Endpoints

### GET `/api/accurate/products`

Query parameters:
- `action=sync` - Full synchronization
- `action=sync-incremental` - Incremental sync
- `action=test-connection` - Test API connection
- `action=setup-webhook` - Setup webhook

### POST `/api/webhooks/accurate`

Menerima webhook dari Accurate untuk events:
- `item.created` - Produk baru dibuat
- `item.updated` - Produk diperbarui
- `item.deleted` - Produk dihapus

## Struktur Data

### Accurate Product Structure
```typescript
interface AccurateProduct {
  id: string
  itemNo: string
  name: string
  description?: string
  unitPrice: number
  averageCost: number
  quantity: number
  unitOfMeasure: string
  itemCategoryId?: string
  itemCategoryName?: string
  brandId?: string
  brandName?: string
  isActive: boolean
  lastModified: string
  createdDate: string
}
```

### Mapping ke Database
- `accurate_id` → `id`
- `itemNo` → `accurate_item_no` & `model`
- `name` → `name`
- `description` → `description`
- `unitPrice` → `price`
- `quantity` → `stock_quantity`
- `itemCategoryName` → `category`
- `brandName` → `brand`
- `isActive` → `status` (active/inactive)

## Security

### Webhook Verification
Webhook dilindungi dengan signature verification menggunakan HMAC SHA256:

```javascript
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex')
```

### Rate Limiting
- API calls dibatasi dengan delay 500ms antar batch
- Batch size maksimal 50 produk per request
- Auto-retry dengan exponential backoff

## Monitoring & Logging

### Sync Logs
Semua aktivitas sinkronisasi dicatat di tabel `accurate_sync_logs`:

- `sync_type`: full_sync, incremental_sync, webhook
- `status`: running, success, warning, error
- `records_processed`: jumlah data yang diproses
- `records_created`: jumlah data baru
- `records_updated`: jumlah data yang diperbarui
- `records_failed`: jumlah data yang gagal
- `error_message`: detail error jika ada
- `duration_seconds`: durasi proses

### Error Handling
- Automatic retry untuk network errors
- Graceful degradation jika Accurate API down
- Detailed error logging untuk debugging

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Periksa Client ID dan Client Secret
   - Pastikan aplikasi sudah diaktifkan di Accurate

2. **Connection Timeout**
   - Periksa network connectivity
   - Pastikan firewall tidak memblokir akses ke api.accurate.id

3. **Webhook Not Working**
   - Pastikan webhook URL accessible dari internet
   - Periksa webhook secret configuration
   - Verify SSL certificate valid

4. **Sync Performance Issues**
   - Gunakan incremental sync untuk update rutin
   - Monitor database performance
   - Adjust batch size jika diperlukan

### Debug Mode

Aktifkan debug mode dengan menambahkan ke `.env.local`:

```env
DEBUG_ACCURATE=true
```

Akan menampilkan detailed logs di console untuk troubleshooting.

## Best Practices

1. **Jadwal Sync**
   - Full sync: 1x per hari (malam hari)
   - Incremental sync: setiap 1-2 jam
   - Webhook untuk real-time updates

2. **Monitoring**
   - Setup alerting untuk sync failures
   - Monitor sync duration dan performance
   - Regular backup sebelum major sync

3. **Testing**
   - Test di staging environment dulu
   - Backup database sebelum full sync
   - Monitor sync logs secara berkala

## Support

Untuk bantuan lebih lanjut:
- Dokumentasi Accurate API: https://accurate.id/api-docs
- Support Email: support@hokiindo.com 