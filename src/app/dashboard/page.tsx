"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Calendar, 
  Package, 
  LogOut, 
  Settings, 
  ShoppingCart,
  Loader2,
  Shield,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { orderService, Order, OrderItem } from '@/lib/supabase';
import { formatRupiah } from '@/utils/formatters';

const DashboardPage = () => {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const { lang } = useLang();

  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Load user orders
  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setOrdersLoading(true);
      const userOrders = await orderService.getUserOrders(user.id);
      setOrders(userOrders);
      
      // Calculate total spent
      const total = userOrders.reduce((sum, order) => sum + order.total_amount, 0);
      setTotalSpent(total);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'sedang_diperiksa_admin':
        return {
          label: 'Sedang Diperiksa Admin',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="w-4 h-4" />
        };
      case 'disetujui':
        return {
          label: 'Disetujui',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'ditolak':
        return {
          label: 'Ditolak',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="w-4 h-4" />
        };
      case 'selesai':
        return {
          label: 'Selesai',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Package className="w-4 h-4" />
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock className="w-4 h-4" />
        };
    }
  };

  const getPaymentStatusInfo = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pending':
        return {
          label: 'Menunggu Pembayaran',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <Clock className="w-4 h-4" />
        };
      case 'paid':
        return {
          label: 'Sudah Dibayar',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'failed':
        return {
          label: 'Pembayaran Gagal',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="w-4 h-4" />
        };
      case 'refunded':
        return {
          label: 'Refund',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <DollarSign className="w-4 h-4" />
        };
      default:
        return {
          label: paymentStatus,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <CreditCard className="w-4 h-4" />
        };
    }
  };

  const copyOrderNumber = async (orderNumber: string) => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopiedOrderNumber(orderNumber);
      setTimeout(() => setCopiedOrderNumber(null), 2000);
    } catch (err) {
      console.error('Failed to copy order number:', err);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-gray-600">{lang.common.loading}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{lang.auth.dashboard}</h1>
          <p className="text-gray-600 mt-2">Selamat datang kembali, {user.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                  <p className="text-sm text-gray-500">Informasi akun Anda</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{user.email}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Bergabung:</span>
                  <span className="ml-2 font-medium">
                    {new Date(user.created_at || '').toLocaleDateString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <Shield className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    user.email_confirmed_at 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.email_confirmed_at ? 'Terverifikasi' : 'Belum Verifikasi'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {lang.auth.logout}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/products')}
                  className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Package className="w-6 h-6 text-red-600 mr-3" />
                  <span className="text-sm font-medium">Lihat Produk</span>
                </button>
                
                <button
                  onClick={() => router.push('/cart')}
                  className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShoppingCart className="w-6 h-6 text-red-600 mr-3" />
                  <span className="text-sm font-medium">Keranjang</span>
                </button>
                
                <button
                  className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-6 h-6 text-red-600 mr-3" />
                  <span className="text-sm font-medium">Pengaturan</span>
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Riwayat Pesanan</h3>
                  {orders.length > 0 && (
                    <span className="text-sm text-gray-500">{orders.length} pesanan</span>
                  )}
                </div>
              </div>
              
              {ordersLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
                  <p className="text-gray-500">Memuat pesanan...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Pesanan</h4>
                  <p className="text-gray-500 mb-6">
                    Pesanan Anda akan muncul di sini setelah melakukan pembelian
                  </p>
                  <button
                    onClick={() => router.push('/products')}
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {orders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const paymentInfo = getPaymentStatusInfo(order.payment_status);
                    const isExpanded = expandedOrder === order.id;
                    const shippingAddress = order.shipping_address;
                    
                    return (
                      <div key={order.id} className="p-6">
                        {/* Order Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{order.order_number}</h4>
                              <button
                                onClick={() => copyOrderNumber(order.order_number)}
                                className={`p-1 rounded ${copiedOrderNumber === order.order_number ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Copy order number"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="flex items-center space-x-3 mb-3">
                              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                {statusInfo.icon}
                                <span>{statusInfo.label}</span>
                              </span>
                              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${paymentInfo.color}`}>
                                {paymentInfo.icon}
                                <span>{paymentInfo.label}</span>
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Tanggal:</span>
                                <div className="font-medium">{new Date(order.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Item:</span>
                                <div className="font-medium">{order.items?.length || 0} produk</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Subtotal:</span>
                                <div className="font-medium">{formatRupiah(order.subtotal)}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Total:</span>
                                <div className="font-bold text-lg text-red-600">{formatRupiah(order.total_amount)}</div>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <span>{isExpanded ? 'Sembunyikan' : 'Detail'}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Expanded Order Details */}
                        {isExpanded && (
                          <div className="mt-6 space-y-6 border-t border-gray-200 pt-6">
                            {/* Shipping Address */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                                Alamat Pengiriman
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div className="font-medium">{shippingAddress?.recipient_name}</div>
                                <div className="flex items-center text-gray-600">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {shippingAddress?.phone}
                                </div>
                                <div className="text-gray-700">
                                  {shippingAddress?.address_line}<br />
                                  {shippingAddress?.city}, {shippingAddress?.province} {shippingAddress?.postal_code}
                                </div>
                                {shippingAddress?.label && (
                                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {shippingAddress.label}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Order Items */}
                            <div>
                              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Package className="w-4 h-4 mr-2 text-gray-600" />
                                Detail Produk ({order.items?.length || 0} item)
                              </h5>
                              <div className="space-y-3">
                                {order.items?.map((item, index) => (
                                  <div key={item.id || index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                      {item.product_image ? (
                                        <img 
                                          src={item.product_image} 
                                          alt={item.product_name}
                                          className="w-10 h-10 object-contain"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "https://placehold.co/48x48/f3f4f6/9ca3af?text=Product";
                                          }}
                                        />
                                      ) : (
                                        <Package className="w-6 h-6 text-gray-400" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h6 className="font-medium text-gray-900 truncate">{item.product_name}</h6>
                                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                        <span>{formatRupiah(item.unit_price)} × {item.quantity}</span>
                                        <span className="font-medium text-gray-900">{formatRupiah(item.total_price)}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                                <CreditCard className="w-4 h-4 mr-2 text-gray-600" />
                                Ringkasan Pembayaran
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Subtotal:</span>
                                  <span>{formatRupiah(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Ongkos Kirim:</span>
                                  <span>{order.shipping_cost > 0 ? formatRupiah(order.shipping_cost) : 'Akan dihitung'}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-base border-t border-gray-300 pt-2">
                                  <span>Total:</span>
                                  <span className="text-red-600">{formatRupiah(order.total_amount)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Notes */}
                            {order.notes && (
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h5 className="font-medium text-blue-900 mb-2">Catatan:</h5>
                                <p className="text-blue-800 text-sm">{order.notes}</p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                              {order.payment_status === 'pending' && (
                                <button className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Bayar Sekarang
                                </button>
                              )}
                              <a
                                href="https://wa.me/628111086180"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Hubungi Admin
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                    <div className="text-sm text-gray-500">Total Pesanan</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-lg font-bold text-green-600">{formatRupiah(totalSpent)}</div>
                    <div className="text-sm text-gray-500">Total Pembelian</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-yellow-600">
                      {orders.filter(order => order.status === 'sedang_diperiksa_admin').length}
                    </div>
                    <div className="text-sm text-gray-500">Sedang Diproses</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-green-600">
                      {orders.filter(order => order.status === 'selesai').length}
                    </div>
                    <div className="text-sm text-gray-500">Selesai</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Pembayaran</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">
                    {orders.filter(order => order.payment_status === 'pending').length}
                  </div>
                  <div className="text-sm text-orange-700">Menunggu Bayar</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {orders.filter(order => order.payment_status === 'paid').length}
                  </div>
                  <div className="text-sm text-green-700">Sudah Dibayar</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">
                    {orders.filter(order => order.payment_status === 'failed').length}
                  </div>
                  <div className="text-sm text-red-700">Gagal</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {orders.filter(order => order.payment_status === 'refunded').length}
                  </div>
                  <div className="text-sm text-purple-700">Refund</div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Butuh Bantuan?</h3>
              <p className="text-blue-700 text-sm mb-4">
                Tim customer service kami siap membantu Anda 24/7
              </p>
              <a
                href="https://wa.me/628111086180"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage; 