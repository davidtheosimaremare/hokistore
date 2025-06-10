# Debugging Accurate API Integration

## Overview

Dokumentasi ini menjelaskan cara melakukan debugging untuk integrasi Accurate API ketika terjadi kegagalan. Sistem akan echo/log detail informasi termasuk bearer token, timestamp, dan secret key untuk troubleshooting.

## 🔍 Debug Endpoints

### 1. Configuration Check
```bash
GET /api/debug/accurate?action=config
```

Menampilkan konfigurasi environment variables dan validasi setup:

```json
{
  "success": true,
  "config": {
    "accurate": {
      "apiUrl": "https://api.accurate.id",
      "clientId": {
        "exists": true,
        "length": 32,
        "preview": "abc12345..."
      },
      "clientSecret": {
        "exists": true,
        "length": 64,
        "preview": "xyz1****"
      },
      "companyId": {
        "exists": true,
        "value": "12345"
      }
    }
  }
}
```

### 2. Authentication Test
```bash
GET /api/debug/accurate?action=auth
```

Test autentikasi dan connection dengan logging detail:

```json
{
  "success": true,
  "auth": {
    "authenticated": true,
    "connectionTest": true,
    "companyData": {...}
  }
}
```

### 3. Full Debug Check
```bash
GET /api/debug/accurate?action=full-debug
```

Comprehensive check termasuk config, auth, dan system info.

## 🚨 Error Logging

### Authentication Errors

Ketika authentication gagal, sistem akan log:

```javascript
console.error('❌ Accurate authentication failed:', {
  timestamp: '2024-01-15T10:30:00.000Z',
  error: 'Authentication failed',
  status: 401,
  statusText: 'Unauthorized',
  responseData: { error: 'invalid_client' },
  requestConfig: {
    baseURL: 'https://api.accurate.id',
    clientId: 'abc12345...',
    clientSecretMasked: 'xyz1****'
  }
})
```

### API Request Errors

Untuk setiap API call yang gagal:

```javascript
console.error('❌ Failed to fetch products from Accurate:', {
  timestamp: '2024-01-15T10:30:00.000Z',
  error: 'Network Error',
  status: 500,
  statusText: 'Internal Server Error',
  responseData: {...},
  requestConfig: {
    url: '/api/item/list.do',
    method: 'GET',
    params: {...},
    bearerToken: 'eyJ0eXAiOiJ...',  // First 10 chars + ...
    companyId: '12345'
  }
})
```

### Webhook Signature Errors

Untuk webhook signature verification:

```javascript
console.error('❌ Invalid webhook signature:', {
  timestamp: '2024-01-15T10:30:00.000Z',
  receivedSignature: 'sha256=abc123...',
  expectedSignature: 'sha256=def456...',
  secretLength: 32,
  secretPreview: 'xyz1****',
  payloadLength: 256,
  bodyLength: 256
})
```

## 🛠️ Manual Debug Commands

### Enable/Disable Debug Mode

```bash
# Enable detailed logging
POST /api/debug/accurate
{
  "command": "enable-debug"
}

# Disable debug logging
POST /api/debug/accurate
{
  "command": "disable-debug"
}
```

### Test Webhook Signature

```bash
POST /api/debug/accurate
{
  "command": "test-webhook-signature",
  "data": {
    "payload": "webhook payload",
    "signature": "calculated_signature",
    "secret": "webhook_secret"
  }
}
```

## 📋 Debug Checklist

### 1. Environment Variables
```bash
# Required
✅ ACCURATE_API_URL=https://api.accurate.id
✅ ACCURATE_CLIENT_ID=your_client_id
✅ ACCURATE_CLIENT_SECRET=your_client_secret
✅ ACCURATE_COMPANY_ID=your_company_id

# Optional
⚡ ACCURATE_WEBHOOK_SECRET=your_webhook_secret
⚡ DEBUG_ACCURATE=true
```

### 2. Network Connectivity
```bash
# Test API endpoint accessibility
curl -I https://api.accurate.id

# Check DNS resolution
nslookup api.accurate.id

# Test from server
wget -O- https://api.accurate.id/health 2>/dev/null
```

### 3. Authentication Flow

1. **Client Credentials Check**
   ```javascript
   // Console akan menampilkan:
   console.log('🔐 Accurate Authentication Request:', {
     timestamp: '2024-01-15T10:30:00.000Z',
     baseURL: 'https://api.accurate.id',
     clientId: 'abc12345...',
     clientSecretLength: 64,
     scope: 'item_read item_write'
   })
   ```

2. **Token Response**
   ```javascript
   console.log('✅ Authentication successful:', {
     timestamp: '2024-01-15T10:30:00.000Z',
     tokenLength: 256,
     refreshTokenExists: true,
     expiresIn: 3600
   })
   ```

3. **Bearer Token Usage**
   ```javascript
   console.log('📤 API Request with Auth:', {
     timestamp: '2024-01-15T10:30:00.000Z',
     method: 'GET',
     url: '/api/item/list.do',
     bearerTokenLength: 256,
     bearerTokenPreview: 'eyJ0eXAiOiJ...',
     headers: {
       'Authorization': 'Bearer eyJ0eXAiOiJ...'
     }
   })
   ```

## 🔧 Common Issues & Solutions

### 1. Authentication Failed

**Symptoms:**
```
❌ Accurate authentication failed: Authentication failed
```

**Debug Steps:**
1. Check client credentials:
   ```bash
   GET /api/debug/accurate?action=config
   ```

2. Verify credentials in Accurate Developer Portal

3. Test manual authentication:
   ```bash
   curl -X POST https://api.accurate.id/oauth/token \
     -H "Content-Type: application/json" \
     -d '{
       "grant_type": "client_credentials",
       "client_id": "your_client_id",
       "client_secret": "your_client_secret",
       "scope": "item_read item_write"
     }'
   ```

### 2. Connection Timeout

**Symptoms:**
```
❌ Failed to fetch products: Network Error
```

**Debug Steps:**
1. Check network connectivity
2. Verify firewall settings
3. Test API endpoint manually
4. Check rate limiting

### 3. Invalid Bearer Token

**Symptoms:**
```
❌ API Request failed: 401 Unauthorized
```

**Debug Steps:**
1. Check token expiration
2. Force re-authentication
3. Verify token format
4. Check token storage

### 4. Webhook Signature Mismatch

**Symptoms:**
```
❌ Invalid webhook signature
```

**Debug Steps:**
1. Verify webhook secret configuration
2. Check payload format
3. Test signature calculation:
   ```bash
   POST /api/debug/accurate
   {
     "command": "test-webhook-signature",
     "data": {
       "payload": "actual_webhook_payload",
       "signature": "received_signature",
       "secret": "configured_secret"
     }
   }
   ```

## 📊 Monitoring Dashboard

### Console Output Examples

#### Successful Sync
```
✅ [AUTH] Authentication successful
📦 [API] Fetching products from Accurate
✅ [API] Products fetch successful: 150 products
🔄 [SYNC] Processing batch 1/3
✅ [SYNC] Full sync completed: 150 processed, 25 created, 125 updated, 0 failed
```

#### Failed Sync
```
❌ [AUTH] Authentication failed: invalid_client
❌ [SYNC] Full sync failed: Authentication failed
```

#### Webhook Processing
```
📥 [WEBHOOK] Webhook received: item.updated
🔐 [WEBHOOK] Verifying signature
✅ [WEBHOOK] Signature valid
✅ [WEBHOOK] Product updated: SKU-12345
```

### Performance Metrics

Debug logs include timing information:

```javascript
console.log('⏱️ [PERFORMANCE] Sync timing:', {
  authTime: '1.2s',
  fetchTime: '5.4s',
  processTime: '12.8s',
  totalTime: '19.4s',
  throughput: '7.7 products/second'
})
```

## 🚀 Best Practices

### 1. Development Environment
```bash
# Enable full debug logging
DEBUG_ACCURATE=true
NODE_ENV=development
```

### 2. Production Environment
```bash
# Minimal logging, only errors
DEBUG_ACCURATE=false
NODE_ENV=production
```

### 3. Staging Environment
```bash
# Moderate logging for testing
DEBUG_ACCURATE=true
NODE_ENV=staging
```

### 4. Log Monitoring

Set up alerts for:
- Authentication failures
- API rate limit exceeded
- Webhook signature failures
- Sync completion with errors

### 5. Security Considerations

- Bearer tokens are masked in logs (first 10 chars only)
- Client secrets show length + preview only
- Webhook secrets are masked
- Full payloads are limited to first 100 chars

## 📞 Support Information

Jika masih mengalami masalah setelah debugging:

1. **Collect Debug Info:**
   ```bash
   GET /api/debug/accurate?action=full-debug
   ```

2. **Export Logs:**
   - Console logs dari browser/server
   - Network request logs
   - Database sync logs

3. **Contact Support:**
   - Email: support@hokiindo.com
   - Include: timestamp, error messages, debug output
   - Mention: Accurate API integration issue

## 🔄 Continuous Monitoring

### Health Check Endpoint
```bash
GET /api/debug/accurate
```

Returns system status untuk monitoring tools.

### Automated Testing
```bash
# Daily health check
curl -s /api/debug/accurate?action=auth | jq '.success'

# Weekly full debug
curl -s /api/debug/accurate?action=full-debug > debug_$(date +%Y%m%d).json
``` 