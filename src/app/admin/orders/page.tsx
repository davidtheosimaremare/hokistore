"use client";

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  X
} from 'lucide-react'

interface OrderItem {
  name: string
  sku: string
  qty: number
  price: number
}

interface Customer {
  name: string
  email: string
  phone: string
  address: string
}

interface Order {
  id: string
  customer: Customer
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  shippingStatus: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: string
  deliveryDate: string | null
  notes: string
}

// Mock order data
const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    customer: {
      name: "PT Astra International",
      email: "procurement@astra.co.id",
      phone: "+62 21 8520 9000",
      address: "Jl. Gaya Motor Raya No.8, Jakarta Selatan"
    },
    items: [
      { name: "Siemens PLC S7-1200", sku: "6ES7214-1AG40-0XB0", qty: 2, price: 45000000 },
      { name: "HMI Panel KTP700", sku: "6AV2123-2GB03-0AX0", qty: 1, price: 35000000 }
    ],
    total: 125000000,
    status: "completed",
    paymentStatus: "paid",
    shippingStatus: "delivered",
    orderDate: "2024-01-15T10:30:00Z",
    deliveryDate: "2024-01-18T14:00:00Z",
    notes: "Urgent delivery requested for factory upgrade project"
  },
  {
    id: "ORD-2024-002",
    customer: {
      name: "PT United Tractors",
      email: "supply@unitedtractors.com",
      phone: "+62 21 5294 8888",
      address: "Jl. Raya Bekasi Km. 22, Cakung, Jakarta Timur"
    },
    items: [
      { name: "SINAMICS V20 Drive", sku: "6SL3210-5BB18-0UV0", qty: 3, price: 78000000 }
    ],
    total: 234000000,
    status: "processing",
    paymentStatus: "paid",
    shippingStatus: "preparing",
    orderDate: "2024-01-14T15:45:00Z",
    deliveryDate: null,
    notes: "Standard delivery, no rush"
  },
  {
    id: "ORD-2024-003",
    customer: {
      name: "PT Pertamina",
      email: "procurement@pertamina.com", 
      phone: "+62 21 3815 3000",
      address: "Jl. Medan Merdeka Timur No.1A, Jakarta Pusat"
    },
    items: [
      { name: "Safety Relay 3SK1", sku: "3SK1112-1CB40", qty: 5, price: 8500000 },
      { name: "SITOP Power Supply", sku: "6EP1334-3BA10", qty: 2, price: 12500000 }
    ],
    total: 67500000,
    status: "pending", 
    paymentStatus: "pending",
    shippingStatus: "pending",
    orderDate: "2024-01-13T09:15:00Z",
    deliveryDate: null,
    notes: "Waiting for payment confirmation"
  },
  {
    id: "ORD-2024-004",
    customer: {
      name: "PT PLN (Persero)",
      email: "procurement@pln.co.id",
      phone: "+62 21 7945 4545",
      address: "Jl. Trunojoyo Blok M I/135, Jakarta Selatan"
    },
    items: [
      { name: "Power Distribution Panel", sku: "PDPN-001", qty: 1, price: 89000000 }
    ],
    total: 89000000,
    status: "cancelled",
    paymentStatus: "refunded", 
    shippingStatus: "cancelled",
    orderDate: "2024-01-12T11:20:00Z",
    deliveryDate: null,
    notes: "Customer requested cancellation due to project delay"
  }
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(mockOrders)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    filterOrders()
  }, [searchQuery, selectedStatus, orders])

  const filterOrders = () => {
    let filtered = orders

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(order => order.status === selectedStatus)
    }

    setFilteredOrders(filtered)
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
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  const getPaymentBadge = (status: string) => {
    const statusColors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedStatus('')
  }

  // Calculate stats
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, order) => sum + order.total, 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const completedOrders = orders.filter(o => o.status === 'completed').length

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600 text-sm">Manage customer orders and sales</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Clear Filters */}
            {(searchQuery || selectedStatus) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(order.total)}</div>
                      <div className="text-sm text-gray-500">{order.items.length} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentBadge(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No orders match your current search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
} 