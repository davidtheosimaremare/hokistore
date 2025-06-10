/**
 * Debug utility for Accurate API integration
 */

interface DebugInfo {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'success'
  category: string
  message: string
  data?: any
}

class AccurateDebugger {
  private isDebugMode: boolean

  constructor() {
    this.isDebugMode = process.env.DEBUG_ACCURATE === 'true' || process.env.NODE_ENV === 'development'
  }

  private formatMessage(info: DebugInfo): string {
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅'
    }

    return `${emoji[info.level]} [${info.category}] ${info.message}`
  }

  private log(info: DebugInfo): void {
    if (!this.isDebugMode) return

    const message = this.formatMessage(info)
    
    switch (info.level) {
      case 'error':
        console.error(message, info.data || '')
        break
      case 'warn':
        console.warn(message, info.data || '')
        break
      case 'success':
      case 'info':
      default:
        console.log(message, info.data || '')
        break
    }
  }

  // Authentication debugging
  authStart(config: any): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'AUTH',
      message: 'Starting authentication',
      data: {
        baseURL: config.baseURL,
        clientId: config.clientId ? `${config.clientId.substring(0, 8)}...` : 'not set',
        clientSecretLength: config.clientSecret?.length || 0,
        companyId: config.companyId
      }
    })
  }

  authSuccess(tokenInfo: any): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'success',
      category: 'AUTH',
      message: 'Authentication successful',
      data: {
        tokenLength: tokenInfo.accessToken?.length || 0,
        refreshTokenExists: !!tokenInfo.refreshToken,
        expiresIn: tokenInfo.expiresIn || 'unknown'
      }
    })
  }

  authFailed(error: any): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'error',
      category: 'AUTH',
      message: 'Authentication failed',
      data: {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      }
    })
  }

  // API Request debugging
  apiRequest(method: string, url: string, params?: any): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'API',
      message: `${method.toUpperCase()} ${url}`,
      data: {
        params,
        bearerTokenExists: true // We don't want to log the actual token
      }
    })
  }

  apiSuccess(method: string, url: string, responseData?: any): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'success',
      category: 'API',
      message: `${method.toUpperCase()} ${url} - Success`,
      data: {
        statusCode: responseData?.status,
        dataCount: Array.isArray(responseData?.data) ? responseData.data.length : 'N/A'
      }
    })
  }

  apiError(method: string, url: string, error: any): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'error',
      category: 'API',
      message: `${method.toUpperCase()} ${url} - Failed`,
      data: {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestConfig: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params
        }
      }
    })
  }

  // Sync debugging
  syncStart(type: string, details?: any): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'SYNC',
      message: `Starting ${type} sync`,
      data: details
    })
  }

  syncProgress(type: string, progress: any): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'SYNC',
      message: `${type} sync progress`,
      data: progress
    })
  }

  syncComplete(type: string, stats: any): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: stats.failed > 0 ? 'warn' : 'success',
      category: 'SYNC',
      message: `${type} sync completed`,
      data: {
        processed: stats.processed,
        created: stats.created,
        updated: stats.updated,
        failed: stats.failed,
        duration: stats.duration
      }
    })
  }

  syncError(type: string, error: any): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'error',
      category: 'SYNC',
      message: `${type} sync failed`,
      data: {
        error: error.message,
        stack: error.stack
      }
    })
  }

  // Webhook debugging
  webhookReceived(event: string, data: any): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'WEBHOOK',
      message: `Webhook received: ${event}`,
      data: {
        itemId: data.id,
        itemNo: data.itemNo,
        eventTimestamp: data.timestamp
      }
    })
  }

  webhookSignature(signature: string, secret: string, payload: string): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'WEBHOOK',
      message: 'Verifying webhook signature',
      data: {
        signatureLength: signature.length,
        signaturePreview: signature ? `${signature.substring(0, 10)}...` : 'not provided',
        secretLength: secret.length,
        secretPreview: secret ? `${secret.substring(0, 4)}****` : 'not set',
        payloadLength: payload.length,
        payloadPreview: payload.substring(0, 100) + '...'
      }
    })
  }

  webhookSignatureResult(isValid: boolean): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: isValid ? 'success' : 'error',
      category: 'WEBHOOK',
      message: `Signature verification ${isValid ? 'successful' : 'failed'}`,
      data: { isValid }
    })
  }

  webhookProcessed(event: string, success: boolean, message: string): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: success ? 'success' : 'error',
      category: 'WEBHOOK',
      message: `Webhook ${event} processed`,
      data: { success, message }
    })
  }

  // Environment debugging
  envCheck(): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'ENV',
      message: 'Environment configuration check',
      data: {
        nodeEnv: process.env.NODE_ENV,
        debugMode: this.isDebugMode,
        accurateApiUrl: process.env.ACCURATE_API_URL,
        clientIdExists: !!process.env.ACCURATE_CLIENT_ID,
        clientSecretExists: !!process.env.ACCURATE_CLIENT_SECRET,
        companyIdExists: !!process.env.ACCURATE_COMPANY_ID,
        webhookSecretExists: !!process.env.ACCURATE_WEBHOOK_SECRET,
        appUrl: process.env.NEXT_PUBLIC_APP_URL
      }
    })
  }

  // Connection test debugging
  connectionTest(success: boolean, data?: any): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: success ? 'success' : 'error',
      category: 'CONNECTION',
      message: `Connection test ${success ? 'passed' : 'failed'}`,
      data
    })
  }
}

// Export singleton instance
export const accurateDebugger = new AccurateDebugger()

// Helper function for conditional debugging
export function debugAccurate(category: string, message: string, data?: any): void {
  if (process.env.DEBUG_ACCURATE === 'true' || process.env.NODE_ENV === 'development') {
    console.log(`🔍 [${category}] ${message}`, data || '')
  }
}

// Export for manual debugging
export function enableAccurateDebug(): void {
  process.env.DEBUG_ACCURATE = 'true'
  console.log('✅ Accurate API debug mode enabled')
}

export function disableAccurateDebug(): void {
  process.env.DEBUG_ACCURATE = 'false'
  console.log('❌ Accurate API debug mode disabled')
} 