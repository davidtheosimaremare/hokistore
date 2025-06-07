"use client";

import React, { useEffect } from 'react';
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
  Shield
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';

const DashboardPage = () => {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const { lang } = useLang();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pesanan Terbaru</h3>
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada pesanan</p>
                <p className="text-sm text-gray-400 mt-1">
                  Pesanan Anda akan muncul di sini setelah melakukan pembelian
                </p>
                <button
                  onClick={() => router.push('/products')}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Mulai Belanja
                </button>
              </div>
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-500">Total Pesanan</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-2xl font-bold text-green-600">Rp 0</div>
                <div className="text-sm text-gray-500">Total Pembelian</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-500">Produk Favorit</div>
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