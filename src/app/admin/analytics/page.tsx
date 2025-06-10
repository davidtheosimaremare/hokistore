"use client";

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Calendar,
  Filter,
  Download
} from 'lucide-react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(false)

  // Mock analytics data
  const statsData = {
    revenue: {
      current: 2450000000,
      previous: 2100000000,
      change: 16.7
    },
    orders: {
      current: 156,
      previous: 142,
      change: 9.9
    },
    customers: {
      current: 89,
      previous: 76,
      change: 17.1
    },
    products: {
      current: 234,
      previous: 198,
      change: 18.2
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 text-sm">Business performance insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(statsData.revenue.current)}</p>
                <div className="flex items-center mt-1">
                  {(() => {
                    const ChangeIcon = getChangeIcon(statsData.revenue.change)
                    return (
                      <>
                        <ChangeIcon className={`w-4 h-4 mr-1 ${getChangeColor(statsData.revenue.change)}`} />
                        <span className={`text-sm font-medium ${getChangeColor(statsData.revenue.change)}`}>
                          {formatPercentage(statsData.revenue.change)}
                        </span>
                      </>
                    )
                  })()}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.orders.current}</p>
                <div className="flex items-center mt-1">
                  {(() => {
                    const ChangeIcon = getChangeIcon(statsData.orders.change)
                    return (
                      <>
                        <ChangeIcon className={`w-4 h-4 mr-1 ${getChangeColor(statsData.orders.change)}`} />
                        <span className={`text-sm font-medium ${getChangeColor(statsData.orders.change)}`}>
                          {formatPercentage(statsData.orders.change)}
                        </span>
                      </>
                    )
                  })()}
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.customers.current}</p>
                <div className="flex items-center mt-1">
                  {(() => {
                    const ChangeIcon = getChangeIcon(statsData.customers.change)
                    return (
                      <>
                        <ChangeIcon className={`w-4 h-4 mr-1 ${getChangeColor(statsData.customers.change)}`} />
                        <span className={`text-sm font-medium ${getChangeColor(statsData.customers.change)}`}>
                          {formatPercentage(statsData.customers.change)}
                        </span>
                      </>
                    )
                  })()}
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.products.current}</p>
                <div className="flex items-center mt-1">
                  {(() => {
                    const ChangeIcon = getChangeIcon(statsData.products.change)
                    return (
                      <>
                        <ChangeIcon className={`w-4 h-4 mr-1 ${getChangeColor(statsData.products.change)}`} />
                        <span className={`text-sm font-medium ${getChangeColor(statsData.products.change)}`}>
                          {formatPercentage(statsData.products.change)}
                        </span>
                      </>
                    )
                  })()}
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart will be implemented here</p>
                <p className="text-sm text-gray-400">Revenue visualization</p>
              </div>
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Orders Overview</h3>
              <ShoppingCart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart will be implemented here</p>
                <p className="text-sm text-gray-400">Orders breakdown</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {[
                { name: 'Siemens PLC S7-1200', sales: 45 },
                { name: 'HMI Panel KTP700', sales: 32 },
                { name: 'SINAMICS V20 Drive', sales: 28 },
                { name: 'Safety Relay 3SK1', sales: 22 },
                { name: 'SITOP Power Supply', sales: 18 }
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(product.sales / 45) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-500">{product.sales}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Segments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Segments</h3>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {[
                { segment: 'Enterprise', count: 45, percentage: 65 },
                { segment: 'SME', count: 28, percentage: 25 },
                { segment: 'Startup', count: 16, percentage: 10 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{item.segment}</p>
                      <span className="text-sm text-gray-500">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {[
                { action: 'New order from PT Astra', time: '2 hours ago', type: 'order' },
                { action: 'Product sync completed', time: '4 hours ago', type: 'sync' },
                { action: 'Customer registration', time: '6 hours ago', type: 'customer' },
                { action: 'Payment received', time: '8 hours ago', type: 'payment' },
                { action: 'Inventory updated', time: '12 hours ago', type: 'inventory' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'order' ? 'bg-blue-600' :
                    activity.type === 'sync' ? 'bg-purple-600' :
                    activity.type === 'customer' ? 'bg-green-600' :
                    activity.type === 'payment' ? 'bg-yellow-600' :
                    'bg-gray-600'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 