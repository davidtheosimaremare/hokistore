"use client";

import { useState } from 'react'
import { RefreshCw, Download, AlertCircle, CheckCircle, Clock, Database, Zap, TestTube, Webhook, Settings } from 'lucide-react'

interface SyncStats {
  processed: number
  created: number
  updated: number
  failed: number
}

interface SyncResult {
  success: boolean
  message: string
  stats?: SyncStats
  errors?: string[]
}

interface ConnectionStatus {
  success: boolean
  message: string
  count?: number
  connection?: {
    status: string
    company: string
  }
}

export default function AccurateSync() {
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isSettingupWebhook, setIsSettingupWebhook] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [syncType, setSyncType] = useState<'full' | 'incremental'>('incremental')

  const handleFullSync = async () => {
    setIsLoading(true)
    setSyncResult(null)

    try {
      console.log('🚀 [COMPONENT] Starting full sync...')
      
      const response = await fetch('/api/accurate/products?action=full-sync', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      console.log('✅ [COMPONENT] Full sync result:', result)
      
      setSyncResult(result)
      
      if (result.success) {
        setLastSync(new Date())
      }
    } catch (error) {
      console.error('❌ [COMPONENT] Full sync error:', error)
      setSyncResult({
        success: false,
        message: 'Gagal melakukan sinkronisasi penuh dengan Zeus Accurate',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleIncrementalSync = async () => {
    setIsLoading(true)
    setSyncResult(null)

    try {
      console.log('🔄 [COMPONENT] Starting incremental sync...')
      
      const response = await fetch('/api/accurate/products?action=sync', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      console.log('✅ [COMPONENT] Incremental sync result:', result)
      
      setSyncResult(result)
      
      if (result.success) {
        setLastSync(new Date())
      }
    } catch (error) {
      console.error('❌ [COMPONENT] Incremental sync error:', error)
      setSyncResult({
        success: false,
        message: 'Gagal melakukan sinkronisasi incremental dengan Zeus Accurate',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus(null)

    try {
      const response = await fetch('/api/accurate/products?action=test-connection', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      setConnectionStatus(result)
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Gagal terhubung ke Accurate API',
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSetupWebhook = async () => {
    setIsSettingupWebhook(true)

    try {
      const response = await fetch('/api/accurate/products?action=setup-webhook', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (result.success) {
        setSyncResult({
          success: true,
          message: 'Webhook berhasil diatur! Produk akan sinkronisasi otomatis.',
        })
      } else {
        setSyncResult({
          success: false,
          message: `Gagal mengatur webhook: ${result.message}`,
        })
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: 'Gagal mengatur webhook',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setIsSettingupWebhook(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Accurate Integration</h3>
            <p className="text-sm text-gray-600">Sinkronisasi data produk dengan Accurate API</p>
          </div>
        </div>
        
        {lastSync && (
          <div className="text-sm text-gray-500 flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Terakhir: {lastSync.toLocaleString('id-ID')}</span>
          </div>
        )}
      </div>

      {/* Connection Status */}
      {connectionStatus && (
        <div className={`p-4 rounded-lg border mb-4 ${
          connectionStatus.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {connectionStatus.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            
            <div className="flex-1">
              <p className={`font-medium ${
                connectionStatus.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {connectionStatus.message}
              </p>

              {connectionStatus.success && connectionStatus.connection && (
                <div className="mt-2 text-sm text-green-700">
                  <p>Status: {connectionStatus.connection.status}</p>
                  <p>Perusahaan: {connectionStatus.connection.company}</p>
                  {connectionStatus.count !== undefined && (
                    <p>Total produk: {connectionStatus.count}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4 mb-6">
        {/* Sync Type Selection */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Tipe Sinkronisasi:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setSyncType('incremental')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                syncType === 'incremental'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Incremental
            </button>
            <button
              onClick={() => setSyncType('full')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                syncType === 'full'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Full Sync
            </button>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {syncType === 'incremental' ? (
            <button
              onClick={handleIncrementalSync}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Zap className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
              <span>{isLoading ? 'Sinkronisasi...' : 'Sinkronisasi Incremental'}</span>
            </button>
          ) : (
            <button
              onClick={handleFullSync}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Sinkronisasi...' : 'Full Sinkronisasi'}</span>
            </button>
          )}

          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <TestTube className={`w-4 h-4 ${isTestingConnection ? 'animate-pulse' : ''}`} />
            <span>{isTestingConnection ? 'Testing...' : 'Test Koneksi'}</span>
          </button>

          <button
            onClick={handleSetupWebhook}
            disabled={isSettingupWebhook}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Webhook className={`w-4 h-4 ${isSettingupWebhook ? 'animate-pulse' : ''}`} />
            <span>{isSettingupWebhook ? 'Setup...' : 'Setup Webhook'}</span>
          </button>
        </div>

        {/* Info Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• <strong>Incremental:</strong> Hanya sinkronisasi produk yang dimodifikasi sejak sync terakhir</p>
          <p>• <strong>Full Sync:</strong> Sinkronisasi semua produk dari Accurate (lebih lama)</p>
          <p>• <strong>Webhook:</strong> Mengatur auto-sync ketika ada perubahan data di Accurate</p>
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className={`p-4 rounded-lg border ${
          syncResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {syncResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            
            <div className="flex-1">
              <p className={`font-medium ${
                syncResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {syncResult.message}
              </p>

              {/* Stats */}
              {syncResult.stats && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-semibold text-gray-900">
                      {syncResult.stats.processed}
                    </div>
                    <div className="text-xs text-gray-600">Diproses</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-semibold text-green-600">
                      {syncResult.stats.created}
                    </div>
                    <div className="text-xs text-gray-600">Dibuat</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-semibold text-blue-600">
                      {syncResult.stats.updated}
                    </div>
                    <div className="text-xs text-gray-600">Diperbarui</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-semibold text-red-600">
                      {syncResult.stats.failed}
                    </div>
                    <div className="text-xs text-gray-600">Gagal</div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {syncResult.errors && syncResult.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-red-800 mb-2">Detail Error:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {syncResult.errors.map((error, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span className="text-red-500">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Informasi Sinkronisasi</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Sinkronisasi akan mengambil semua produk dari Accurate</li>
          <li>• Produk yang sudah ada akan diperbarui dengan data terbaru</li>
          <li>• Produk baru akan ditambahkan ke database</li>
          <li>• Proses ini mungkin membutuhkan waktu beberapa menit</li>
        </ul>
      </div>
    </div>
  )
} 