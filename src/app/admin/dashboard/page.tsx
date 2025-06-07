'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Card, 
  CardBody, 
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Progress
} from '@nextui-org/react'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Clock,
  DollarSign,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  productChange: number
  orderChange: number
  userChange: number
  revenueChange: number
}

interface RecentOrder {
  id: string
  customer_name: string
  product_name: string
  amount: number
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    productChange: 0,
    orderChange: 0,
    userChange: 0,
    revenueChange: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Load orders count  
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      // Load users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Load recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          product_name,
          amount,
          status,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalUsers: usersCount || 0,
        totalRevenue: 0, // Calculate from orders
        productChange: 12.5,
        orderChange: 8.3,
        userChange: 15.2,
        revenueChange: 23.1
      })

      setRecentOrders(orders || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'cancelled':
        return 'danger'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardBody className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Produk</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">{stats.productChange}%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-md">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transaksi</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">{stats.orderChange}%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-md">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pengguna</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">{stats.userChange}%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-md">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pendapatan</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">{stats.revenueChange}%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Transaksi Terbaru</h3>
              <Button size="sm" variant="ghost" endContent={<Eye className="w-4 h-4" />}>
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <Table aria-label="Recent orders" removeWrapper>
              <TableHeader>
                <TableColumn>Pelanggan</TableColumn>
                <TableColumn>Produk</TableColumn>
                <TableColumn>Jumlah</TableColumn>
                <TableColumn>Status</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Belum ada transaksi">
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{order.product_name}</TableCell>
                    <TableCell>{formatCurrency(order.amount)}</TableCell>
                    <TableCell>
                      <Chip 
                        color={getStatusColor(order.status)} 
                        size="sm"
                        className="capitalize"
                      >
                        {order.status}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold">Aksi Cepat</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <Button 
              color="primary" 
              className="w-full justify-start" 
              startContent={<Package className="w-4 h-4" />}
            >
              Tambah Produk Baru
            </Button>
            <Button 
              color="secondary" 
              variant="bordered"
              className="w-full justify-start" 
              startContent={<TrendingUp className="w-4 h-4" />}
            >
              Sinkron Data Accurate
            </Button>
            <Button 
              color="success" 
              variant="bordered"
              className="w-full justify-start" 
              startContent={<Users className="w-4 h-4" />}
            >
              Kelola Pengguna
            </Button>
            <Button 
              color="warning" 
              variant="bordered"
              className="w-full justify-start" 
              startContent={<Clock className="w-4 h-4" />}
            >
              Lihat Laporan
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Activity Overview */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <h3 className="text-lg font-semibold">Aktivitas Sistem</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sinkronisasi Produk</span>
              <Progress value={85} className="w-1/2" color="primary" size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Backup Database</span>
              <Progress value={100} className="w-1/2" color="success" size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pembaruan Stok</span>
              <Progress value={60} className="w-1/2" color="warning" size="sm" />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 