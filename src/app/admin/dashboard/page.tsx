"use client";

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  totalCategories: number
  lastSyncDate: string | null
  totalValue: number
}

interface RecentProduct {
  id: string
  name: string
  price: number
  stock_quantity: number
  category: string
  status: string
  created_at: string
}

interface SyncLog {
  id: string
  sync_type: string
  status: string
  records_processed: number
  records_created: number
  records_updated: number
  started_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])
  const [recentSyncs, setRecentSyncs] = useState<SyncLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load products stats
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, category, status, created_at')
        .order('created_at', { ascending: false })

      if (productsError) {
        console.error('Error loading products:', productsError)
        return
      }

      // Load categories count
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id')

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError)
      }

      // Load recent sync logs
      const { data: syncLogs, error: syncError } = await supabase
        .from('accurate_sync_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(5)

      if (syncError) {
        console.error('Error loading sync logs:', syncError)
      }

      // Calculate stats
      if (products) {
        const activeProducts = products.filter(p => p.status === 'active').length
        const lowStockProducts = products.filter(p => p.stock_quantity <= 5).length
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0)
        const lastSync = syncLogs && syncLogs.length > 0 ? syncLogs[0].started_at : null

        setStats({
          totalProducts: products.length,
          activeProducts,
          lowStockProducts,
          totalCategories: categories?.length || 0,
          lastSyncDate: lastSync,
          totalValue
        })

        setRecentProducts(products.slice(0, 5))
      }

      if (syncLogs) {
        setRecentSyncs(syncLogs)
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
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

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      out_of_stock: 'bg-red-100 text-red-800',
      discontinued: 'bg-yellow-100 text-yellow-800'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm">Overview sistem manajemen Hokiindo Raya</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stats?.activeProducts || 0} active
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats?.totalValue || 0)}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Inventory value
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.lowStockProducts || 0}</p>
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Need attention
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalCategories || 0}</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <Users className="w-4 h-4 mr-1" />
                  Product types
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
              <p className="text-sm text-gray-600">Latest products added to inventory</p>
            </div>
            <div className="p-4">
              {recentProducts.length > 0 ? (
                <div className="space-y-3">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.category} • Stock: {product.stock_quantity}
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.status)}`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No products found</p>
              )}
            </div>
          </div>

          {/* Recent Syncs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Sync History</h2>
              <p className="text-sm text-gray-600">Recent Accurate synchronizations</p>
            </div>
            <div className="p-4">
              {recentSyncs.length > 0 ? (
                <div className="space-y-3">
                  {recentSyncs.map((sync) => (
                    <div key={sync.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getSyncStatusIcon(sync.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {sync.sync_type} Sync
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(sync.started_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {sync.records_processed} records
                        </p>
                        <p className="text-xs text-gray-500">
                          {sync.records_created} created, {sync.records_updated} updated
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No sync history found</p>
              )}
            </div>
          </div>
        </div>

        {/* Last Sync Info */}
        {stats?.lastSyncDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Last sync: {formatDate(stats.lastSyncDate)}
                </p>
                <p className="text-sm text-blue-700">
                  Data is synchronized with Accurate system
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
} 