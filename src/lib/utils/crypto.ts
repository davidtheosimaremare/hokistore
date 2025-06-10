import crypto from 'crypto'

/**
 * Accurate API Authentication Utility
 * Untuk Zeus Accurate dengan Bearer Token + Timestamp + HMAC Signature
 */

export interface AccurateAuthConfig {
  bearerToken: string
  secretKey?: string
  timestamp?: string
}

export interface AccurateHeaders {
  'Authorization': string
  'X-Api-Timestamp': string
  'X-Api-Signature': string
  'Content-Type': string
  'Accept': string
}

/**
 * Generate timestamp dengan format dd/mm/yyyy HH:mm:ss
 */
export function generateAccurateTimestamp(): string {
  const now = new Date()
  
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

/**
 * Generate HMAC signature untuk Accurate API
 */
export function generateAccurateSignature(
  timestamp: string,
  secretKey: string = 'default_secret'
): string {
  try {
    // Create signature string: timestamp + secret
    const signatureString = `${timestamp}${secretKey}`
    
    // Generate HMAC-SHA256 signature
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(signatureString)
      .digest('hex')
    
    console.log('🔐 [CRYPTO] Generated signature:', {
      timestamp,
      signatureString: `${timestamp}****`,
      signature: `${signature.substring(0, 10)}...`,
      secretKeyLength: secretKey.length
    })
    
    return signature
  } catch (error) {
    console.error('❌ [CRYPTO] Signature generation failed:', error)
    return ''
  }
}

/**
 * Create headers untuk Accurate Zeus API
 */
export function createAccurateHeaders(
  bearerToken: string,
  secretKey?: string
): AccurateHeaders {
  const timestamp = generateAccurateTimestamp()
  const signature = generateAccurateSignature(timestamp, secretKey)
  
  console.log('📤 [CRYPTO] Creating Accurate headers:', {
    timestamp,
    bearerTokenLength: bearerToken.length,
    bearerTokenPreview: `${bearerToken.substring(0, 20)}...`,
    signatureLength: signature.length,
    signaturePreview: `${signature.substring(0, 10)}...`,
    secretKeyExists: !!secretKey
  })
  
  return {
    'Authorization': `Bearer ${bearerToken}`,
    'X-Api-Timestamp': timestamp,
    'X-Api-Signature': signature,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

/**
 * Verify signature untuk webhook
 */
export function verifyAccurateSignature(
  receivedSignature: string,
  timestamp: string,
  secretKey: string
): boolean {
  try {
    const expectedSignature = generateAccurateSignature(timestamp, secretKey)
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
    
    console.log(isValid ? '✅ [CRYPTO] Signature valid' : '❌ [CRYPTO] Signature invalid:', {
      timestamp,
      receivedSignature: `${receivedSignature.substring(0, 10)}...`,
      expectedSignature: `${expectedSignature.substring(0, 10)}...`,
      isValid
    })
    
    return isValid
  } catch (error) {
    console.error('❌ [CRYPTO] Signature verification error:', error)
    return false
  }
}

/**
 * Validate bearer token format
 */
export function validateBearerToken(token: string): boolean {
  // Accurate bearer token biasanya dimulai dengan "aat."
  if (!token || token.length < 50) {
    console.error('❌ [CRYPTO] Invalid token length:', token.length)
    return false
  }
  
  if (!token.startsWith('aat.')) {
    console.error('❌ [CRYPTO] Invalid token format, should start with "aat."')
    return false
  }
  
  console.log('✅ [CRYPTO] Bearer token format valid:', {
    length: token.length,
    prefix: token.substring(0, 10)
  })
  
  return true
} 