"use client";

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  RefreshCw, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Download,
  Upload,
  History,
  Eye,
  Copy
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SyncLog {
  id: string
  sync_type: string
  status: string
  records_processed: number
  records_created: number
  records_updated: number
  records_failed: number
  error_message: string | null
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  details?: any
}

interface SyncResult {
  success: boolean
  message?: string
  error?: string
  stats?: {
    processed: number
    created: number
    updated: number
    failed: number
  }
  errors?: string[]
  headers?: {
    [key: string]: string
  }
  connectionInfo?: {
    status: string
    sessionInfo?: any
    count?: number
  }
  connection?: {
    status: string
    totalProducts?: number
    pagination?: any
  }
}

export default function AccurateSyncPage() {
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [showHeaders, setShowHeaders] = useState(false)
  const [isFullSyncing, setIsFullSyncing] = useState(false)
  const [fullSyncResult, setFullSyncResult] = useState<SyncResult | null>(null)
  const [connectionResult, setConnectionResult] = useState<SyncResult | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  useEffect(() => {
    loadSyncLogs()
  }, [])

  const loadSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('accurate_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error loading sync logs:', error)
        return
      }

      if (data && data.length > 0) {
        setSyncLogs(data)
        setLastSync(data[0].created_at)
      }
    } catch (error) {
      console.error('Error loading sync logs:', error)
    }
  }

  const handleSync = async () => {
    setIsLoading(true)
    setSyncResult(null)

    try {
      console.log('🚀 [SYNC-PAGE] Starting Zeus Accurate incremental sync...')
      
      const response = await fetch('/api/accurate/products?action=sync', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      // Extract response headers for debugging
      const responseHeaders: { [key: string]: string } = {}
      response.headers.forEach((value, name) => {
        responseHeaders[name] = value
      })

      console.log('📦 [SYNC-PAGE] Incremental sync response:', {
        success: result.success,
        status: response.status,
        headers: responseHeaders,
        result
      })

      // Add headers to result for display on error
      if (!result.success) {
        result.headers = responseHeaders
      }

      setSyncResult(result)
      
      if (result.success) {
        // Reload sync logs after successful sync
        setTimeout(() => {
          loadSyncLogs()
        }, 1000)
      }
    } catch (error: any) {
      console.error('❌ [SYNC-PAGE] Incremental sync error:', error)
      setSyncResult({
        success: false,
        message: 'Gagal melakukan sinkronisasi incremental dengan Zeus Accurate API',
        errors: [error instanceof Error ? error.message : 'Network error'],
        headers: {
          'error-type': 'network-error',
          'error-message': error.message,
          'timestamp': new Date().toISOString()
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFullSync = async () => {
    setIsFullSyncing(true)
    setFullSyncResult(null)
    
    try {
      console.log('🚀 Starting full sync...')
      
      const response = await fetch('/api/accurate/products?action=full-sync', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      setFullSyncResult(data)
      
      if (data.success) {
        console.log('✅ Full sync completed:', data.stats)
        // Refresh sync logs
        await loadSyncLogs()
      } else {
        console.error('❌ Full sync failed:', data.error)
      }
      
    } catch (error: any) {
      console.error('❌ Full sync error:', error)
      setFullSyncResult({
        success: false,
        error: error.message || 'Unknown error occurred'
      })
    } finally {
      setIsFullSyncing(false)
    }
  }

  // New working full sync handler
  const handleWorkingFullSync = async () => {
    setIsFullSyncing(true)
    setFullSyncResult(null)
    
    try {
      console.log('🚀 Starting working full sync...')
      
      const response = await fetch('/api/sync-products?action=full-sync', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      setFullSyncResult(data)
      
      if (data.success) {
        console.log('✅ Working full sync completed:', data.stats)
        // Refresh sync logs
        await loadSyncLogs()
      } else {
        console.error('❌ Working full sync failed:', data.error)
      }
      
    } catch (error: any) {
      console.error('❌ Working full sync error:', error)
      setFullSyncResult({
        success: false,
        error: error.message || 'Unknown error occurred'
      })
    } finally {
      setIsFullSyncing(false)
    }
  }

  const testConnection = async () => {
    setIsTestingConnection(true)
    setConnectionResult(null)
    
    try {
      console.log('🔍 Testing connection...')
      
      const response = await fetch('/api/sync-products?action=test-connection', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      setConnectionResult(data)
      
      if (data.success) {
        console.log('✅ Connection test successful')
      } else {
        console.error('❌ Connection test failed:', data.error)
      }
      
    } catch (error: any) {
      console.error('❌ Connection test error:', error)
      setConnectionResult({
        success: false,
        error: error.message || 'Unknown error occurred'
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const copyHeaders = () => {
    if (syncResult?.headers) {
      const headersText = Object.entries(syncResult.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
      navigator.clipboard.writeText(headersText)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Zeus Accurate Synchronization</h1>
          <p className="text-gray-600 text-sm">Sinkronisasi data produk dengan sistem Zeus Accurate</p>
        </div>

        {/* Sync Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Zeus Accurate API Sync
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={testConnection}
                disabled={isTestingConnection}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isTestingConnection ? 'animate-spin' : ''}`} />
                <span>{isTestingConnection ? 'Testing...' : '🔍 Test Connection'}</span>
              </button>

              <button
                onClick={handleWorkingFullSync}
                disabled={isFullSyncing}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                <Upload className={`w-4 h-4 ${isFullSyncing ? 'animate-spin' : ''}`} />
                <span>{isFullSyncing ? 'Syncing All Products...' : '⚡ Sync All Products (Recommended)'}</span>
              </button>

              <button
                onClick={handleSync}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Syncing...' : '🔄 Incremental Sync'}</span>
              </button>

              <button
                onClick={handleFullSync}
                disabled={isFullSyncing}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <Upload className={`w-4 h-4 ${isFullSyncing ? 'animate-spin' : ''}`} />
                <span>{isFullSyncing ? 'Old Syncing...' : '🔧 Old Full Sync (Debug)'}</span>
              </button>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>🔍 Test Connection:</strong> Cek koneksi dan jumlah produk tersedia</p>
              <p><strong>⚡ Sync All Products:</strong> Sinkronisasi semua produk dari Accurate ke Supabase (Gunakan ini!)</p>
              <p><strong>🔄 Incremental Sync:</strong> Sinkronisasi hanya produk yang berubah</p>
              <p><strong>🔧 Old Full Sync:</strong> Endpoint lama untuk debugging</p>
            </div>
          </div>

          {/* Connection Test Result */}
          {connectionResult && (
            <div className={`mt-6 p-4 rounded-lg border ${
              connectionResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                {connectionResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <p className={`font-medium ${
                    connectionResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {connectionResult.message || connectionResult.error}
                  </p>

                  {connectionResult.success && connectionResult.connection && (
                    <div className="mt-2 text-sm text-green-700">
                      <div>✅ Status: {connectionResult.connection.status}</div>
                      <div>📦 Total Products: <strong>{connectionResult.connection.totalProducts || 0}</strong></div>
                      {connectionResult.connection.pagination && (
                        <div>📄 Pages: {connectionResult.connection.pagination.pageCount}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Full Sync Result */}
          {fullSyncResult && (
            <div className={`mt-6 p-4 rounded-lg border ${
              fullSyncResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                {fullSyncResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <p className={`font-medium ${
                    fullSyncResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {fullSyncResult.message || fullSyncResult.error}
                  </p>

                  {/* Stats */}
                  {fullSyncResult.stats && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-2xl font-bold text-gray-800">
                          {fullSyncResult.stats.processed}
                        </div>
                        <div className="text-xs text-gray-600">Processed</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-2xl font-bold text-green-600">
                          {fullSyncResult.stats.created}
                        </div>
                        <div className="text-xs text-gray-600">Created</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-2xl font-bold text-blue-600">
                          {fullSyncResult.stats.updated}
                        </div>
                        <div className="text-xs text-gray-600">Updated</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-2xl font-bold text-red-600">
                          {fullSyncResult.stats.failed}
                        </div>
                        <div className="text-xs text-gray-600">Failed</div>
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {fullSyncResult.errors && fullSyncResult.errors.length > 0 && (
                    <div className="mt-3">
                      <details className="cursor-pointer">
                        <summary className="text-sm font-medium text-red-700">
                          Show {fullSyncResult.errors.length} Error(s)
                        </summary>
                        <div className="mt-2 space-y-1">
                          {fullSyncResult.errors.map((error, index) => (
                            <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                              {error}
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sync History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Sync History</h2>
            <p className="text-sm text-gray-600">Recent synchronization activities with Zeus Accurate</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {syncLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(log.status)}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 capitalize">{log.sync_type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Processed: {log.records_processed}</div>
                        <div className="text-xs text-gray-500">
                          ✅ {log.records_created} | 🔄 {log.records_updated} | ❌ {log.records_failed}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.started_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {log.details && (
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:text-blue-800">View details</summary>
                            <pre className="text-xs mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                        {!log.details && (log.error_message || 'Sync completed successfully')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {syncLogs.length === 0 && (
              <div className="text-center py-12">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No sync history</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start your first sync to see history here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 