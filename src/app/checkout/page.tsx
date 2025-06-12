"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShoppingCart, 
  MapPin, 
  Package,
  CheckCircle,
  Loader2,
  Plus,
  Edit,
  Trash2,
  User,
  Phone,
  AlertCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { formatRupiah } from '@/utils/formatters';
import { addressService, orderService, UserAddress, OrderItem } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface AddressFormData {
  label: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
}

const CheckoutPage = () => {
  const router = useRouter();
  const { lang } = useLang();
  const { user } = useAuth();
  const { cartItems, cartCount, totalAmount, clearCart, validateStock } = useCart();

  // Generate SEO-friendly product URL
  const generateSEOProductUrl = (id: string, name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return `/products/${id}/${slug}`;
  };
  
  const [currentStep, setCurrentStep] = useState<'address' | 'confirmation'>('address');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  
  // Address management
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);
  
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    label: '',
    recipient_name: '',
    phone: '',
    address_line: '',
    city: '',
    province: '',
    postal_code: ''
  });

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
  }, [user, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems.length, router]);

  // Load user addresses
  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  // Debug: Log cart data to ensure consistency
  useEffect(() => {
    console.log('🛒 Checkout cart data:', {
      cartItems,
      cartCount,
      totalAmount,
      itemCount: cartItems.length
    });
  }, [cartItems, cartCount, totalAmount]);

  const loadAddresses = async () => {
    if (!user) {
      return;
    }

    try {
      setLoadingAddresses(true);
      setAddressError(null);
      
      // Try to load addresses using the service
      const userAddresses = await addressService.getUserAddresses(user.id);
      
      if (userAddresses && userAddresses.length > 0) {
        setAddresses(userAddresses);
        
        // Select default address if available
        const defaultAddress = userAddresses.find(addr => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else {
          setSelectedAddressId(userAddresses[0].id);
        }
      } else {
        // No addresses found
        setAddresses([]);
        setSelectedAddressId('');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setAddressError(error instanceof Error ? error.message : 'Gagal memuat alamat');
      setAddresses([]);
      setSelectedAddressId('');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Anda harus login terlebih dahulu');
      return;
    }
    
    try {
      if (editingAddress) {
        // Update existing address
        await addressService.updateAddress(editingAddress.id, addressForm);
      } else {
        // Create new address
        await addressService.createAddress({
          user_id: user.id,
          ...addressForm,
          is_default: addresses.length === 0 // Set as default if it's the first address
        });
      }
      
      await loadAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Gagal menyimpan alamat. Silakan coba lagi.');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: '',
      recipient_name: '',
      phone: '',
      address_line: '',
      city: '',
      province: '',
      postal_code: ''
    });
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label,
      recipient_name: address.recipient_name,
      phone: address.phone,
      address_line: address.address_line,
      city: address.city,
      province: address.province,
      postal_code: address.postal_code || ''
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
      try {
        await addressService.deleteAddress(addressId);
        await loadAddresses();
        
        // Reset selected address if deleted
        if (selectedAddressId === addressId) {
          setSelectedAddressId('');
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Gagal menghapus alamat. Silakan coba lagi.');
      }
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user) return;
    
    try {
      await addressService.setDefaultAddress(user.id, addressId);
      await loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Gagal mengatur alamat default. Silakan coba lagi.');
    }
  };

  const handleSubmitOrder = async () => {
    console.log('🚀 Starting order submission...');
    
    // Comprehensive validation
    if (!selectedAddressId) {
      alert('Silakan pilih alamat pengiriman');
      return;
    }

    if (!user?.id) {
      alert('Anda harus login terlebih dahulu');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert('Keranjang kosong, silakan tambahkan produk terlebih dahulu');
      router.push('/cart');
      return;
    }

    // Validate cart items data integrity
    const invalidItems = cartItems.filter(item => 
      !item.id || !item.name || !item.price || !item.quantity || 
      item.price <= 0 || item.quantity <= 0
    );

    if (invalidItems.length > 0) {
      console.error('❌ Invalid cart items found:', invalidItems);
      alert('Ada item di keranjang yang tidak valid. Silakan hapus dan tambahkan ulang produk tersebut.');
      return;
    }

    console.log('🛒 Cart data validation passed:', {
      itemCount: cartItems.length,
      totalAmount,
      userId: user.id,
      selectedAddressId
    });

    setIsSubmitting(true);
    
    try {
      // Stock validation with proper error handling
      if (typeof validateStock === 'function') {
        try {
          const stockValidation = await validateStock();
          if (!stockValidation.valid) {
            alert(`Beberapa item di keranjang tidak tersedia:\n${stockValidation.invalidItems.join('\n')}\n\nSilakan perbarui keranjang Anda.`);
            setIsSubmitting(false);
            return;
          }
          console.log('✅ Stock validation passed');
        } catch (stockError) {
          console.warn('⚠️ Stock validation error:', stockError);
          // Continue without stock validation but log the error
        }
      }

      // Find selected address
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      if (!selectedAddress) {
        throw new Error('Alamat pengiriman tidak ditemukan. Silakan pilih alamat yang valid.');
      }

      console.log('✅ Address validated:', {
        label: selectedAddress.label,
        recipient: selectedAddress.recipient_name
      });

      // Prepare shipping address object with all required fields
      const shippingAddress = {
        label: selectedAddress.label,
        recipient_name: selectedAddress.recipient_name,
        phone: selectedAddress.phone,
        address_line: selectedAddress.address_line,
        city: selectedAddress.city,
        province: selectedAddress.province,
        postal_code: selectedAddress.postal_code || ''
      };

      // Validate required shipping address fields
      if (!shippingAddress.recipient_name || !shippingAddress.phone || 
          !shippingAddress.address_line || !shippingAddress.city || !shippingAddress.province) {
        throw new Error('Data alamat pengiriman tidak lengkap. Silakan lengkapi alamat terlebih dahulu.');
      }

      console.log('✅ Shipping address prepared');

      // Calculate totals
      const calculatedSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (Math.abs(calculatedSubtotal - totalAmount) > 0.01) {
        console.warn('⚠️ Total amount mismatch:', { calculatedSubtotal, totalAmount });
      }

      // Prepare order data with proper structure
      const orderData = {
        user_id: user.id,
        shipping_address: shippingAddress,
        subtotal: calculatedSubtotal,
        shipping_cost: 0,
        total_amount: calculatedSubtotal,
        status: 'sedang_diperiksa_admin',
        payment_status: 'pending',
        notes: `Order from checkout - ${cartItems.length} items`
      };

      console.log('📝 Creating order with data:', {
        user_id: orderData.user_id,
        subtotal: orderData.subtotal,
        total_amount: orderData.total_amount,
        status: orderData.status
      });

      // Create order
      const order = await orderService.createOrder(orderData);
      
      if (!order || !order.id) {
        throw new Error('Gagal membuat pesanan. Response tidak valid dari server.');
      }

      console.log('✅ Order created successfully:', {
        id: order.id,
        order_number: order.order_number
      });

             // Prepare order items with validation
       const orderItems = cartItems.map((item, index) => {
         // Validate product ID (accept both string UUID and number)
         let productId: string;
         
         if (typeof item.id === 'string') {
           productId = item.id.trim();
         } else if (typeof item.id === 'number') {
           productId = String(item.id);
         } else {
           throw new Error(`Invalid product ID type for item ${index + 1}: ${typeof item.id}`);
         }

         // Validate that product ID is not empty
         if (!productId || productId.length === 0) {
           throw new Error(`Empty product ID for item "${item.name}"`);
         }

         const itemTotal = item.price * item.quantity;

         return {
           order_id: order.id,
           product_id: productId,
           product_name: item.name.trim(),
           product_image: item.image || undefined,
           quantity: item.quantity,
           unit_price: item.price,
           total_price: itemTotal
         };
       });

             console.log('📦 Creating order items:', {
         count: orderItems.length,
         items: orderItems.map(item => ({
           product_id: item.product_id,
           product_id_type: typeof item.product_id,
           product_name: item.product_name,
           quantity: item.quantity,
           total_price: item.total_price
         }))
       });

             // Create order items
       try {
         const createdOrderItems = await orderService.createOrderItems(orderItems);
         
         if (!createdOrderItems || createdOrderItems.length !== orderItems.length) {
           console.warn('⚠️ Order items creation mismatch:', {
             expected: orderItems.length,
             created: createdOrderItems?.length || 0
           });
         }

         console.log('✅ Order items created successfully');
       } catch (orderItemsError) {
         console.error('❌ Failed to create order items:', orderItemsError);
         
         // Check if it's a database schema issue
         if (orderItemsError instanceof Error) {
           if (orderItemsError.message.includes('column') || orderItemsError.message.includes('type')) {
             throw new Error('Database schema issue: Tabel order_items mungkin belum di-update. Silakan jalankan script SQL yang disediakan di Supabase Dashboard.');
           } else if (orderItemsError.message.includes('permission') || orderItemsError.message.includes('policy')) {
             throw new Error('Permission issue: RLS policy untuk order_items bermasalah. Silakan periksa pengaturan database.');
           }
         }
         
         throw orderItemsError;
       }

      // Clear cart only after successful order creation
      clearCart();
      console.log('✅ Cart cleared');

      // Set order number for display
      setOrderNumber(order.order_number);

      // Success notification
      alert(`✅ Pesanan berhasil dibuat!\n\nNomor Pesanan: ${order.order_number}\nStatus: Sedang diperiksa admin\n\nAnda akan diarahkan ke dashboard untuk melihat detail pesanan.`);
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Order submission error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      let errorMessage = 'Terjadi kesalahan saat memproses pesanan.';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('jwt') || errorMsg.includes('token')) {
          errorMessage = 'Sesi login telah habis. Silakan login kembali.';
          setTimeout(() => router.push('/login?redirect=/checkout'), 2000);
        } else if (errorMsg.includes('permission') || errorMsg.includes('unauthorized')) {
          errorMessage = 'Tidak memiliki izin untuk membuat pesanan. Silakan login kembali.';
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          errorMessage = 'Koneksi internet bermasalah. Silakan periksa koneksi dan coba lagi.';
        } else if (errorMsg.includes('invalid product id')) {
          errorMessage = 'Ada masalah dengan produk di keranjang. Silakan hapus dan tambahkan kembali produk tersebut.';
        } else if (errorMsg.includes('alamat')) {
          errorMessage = error.message;
        } else if (errorMsg.includes('validation')) {
          errorMessage = `Validasi data gagal: ${error.message}`;
        } else {
          errorMessage = `Kesalahan: ${error.message}`;
        }
      }
      
      alert(`❌ ${errorMessage}\n\nJika masalah berlanjut, silakan:\n- Refresh halaman dan coba lagi\n- Periksa koneksi internet\n- Hubungi customer service`);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderComplete = () => {
    clearCart();
    router.push('/');
  };

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-red-600" />
              <span className="text-gray-600 text-sm sm:text-base">Memeriksa autentikasi...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Keranjang Kosong</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base px-4">Tambahkan produk ke keranjang untuk melanjutkan checkout</p>
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors touch-manipulation min-h-[44px] text-sm sm:text-base"
            >
              Lihat Produk
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Progress Steps - Mobile optimized */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors touch-manipulation min-h-[44px] px-2 -ml-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">{lang.common.back}</span>
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className={`flex items-center space-x-1 sm:space-x-2 ${currentStep === 'address' ? 'text-red-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${currentStep === 'address' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>1</div>
                <span className="hidden sm:inline text-sm font-medium">Alamat Pengiriman</span>
                <span className="sm:hidden text-xs font-medium">Alamat</span>
              </div>
              <div className="w-4 sm:w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center space-x-1 sm:space-x-2 ${currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${currentStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>2</div>
                <span className="hidden sm:inline text-sm font-medium">Konfirmasi</span>
                <span className="sm:hidden text-xs font-medium">Selesai</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Step 1: Address Selection */}
        {currentStep === 'address' && (
          <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
            
            {/* Address Selection */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-red-600" />
                    <span className="hidden sm:inline">Pilih Alamat Pengiriman</span>
                    <span className="sm:hidden">Alamat Pengiriman</span>
                  </h2>
                  <button
                    onClick={() => {
                      resetAddressForm();
                      setEditingAddress(null);
                      setShowAddressForm(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 touch-manipulation min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Alamat</span>
                  </button>
                </div>
                
                {/* Error State */}
                {addressError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-red-800 font-medium text-sm sm:text-base">Gagal memuat alamat</p>
                        <p className="text-red-700 text-sm">{addressError}</p>
                        <button
                          onClick={loadAddresses}
                          className="text-red-600 hover:text-red-700 text-sm font-medium mt-1 touch-manipulation"
                        >
                          Coba Lagi
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {loadingAddresses ? (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-red-600" />
                      <span className="text-gray-600 text-sm sm:text-base">Memuat alamat...</span>
                    </div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Belum Ada Alamat</h3>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">Tambahkan alamat pengiriman untuk melanjutkan checkout</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium touch-manipulation min-h-[44px]"
                    >
                      Tambah Alamat Pertama
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors touch-manipulation ${
                          selectedAddressId === address.id
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <input
                                type="radio"
                                checked={selectedAddressId === address.id}
                                onChange={() => setSelectedAddressId(address.id)}
                                className="w-4 h-4 text-red-600 touch-manipulation"
                              />
                              <span className="font-medium text-gray-900 text-sm sm:text-base">{address.label}</span>
                              {address.is_default && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="ml-6 text-sm text-gray-600 space-y-1">
                              <div className="flex items-center space-x-2">
                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                <span className="font-medium text-gray-900 text-sm sm:text-base">{address.recipient_name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm">{address.phone}</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <p>{address.address_line}</p>
                                  <p>{address.city}, {address.province} {address.postal_code}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(address);
                              }}
                              className="text-gray-400 hover:text-blue-600 p-2 touch-manipulation"
                              title="Edit alamat"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {!address.is_default && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(address.id);
                                }}
                                className="text-gray-400 hover:text-red-600 p-2 touch-manipulation"
                                title="Hapus alamat"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {!address.is_default && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefaultAddress(address.id);
                            }}
                            className="ml-6 mt-2 text-sm text-blue-600 hover:text-blue-700 touch-manipulation"
                          >
                            Jadikan Default
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Address Form Modal - Mobile optimized */}
                {showAddressForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                      <div className="p-4 sm:p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                        </h3>
                        
                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Label Alamat <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={addressForm.label}
                              onChange={(e) => setAddressForm({...addressForm, label: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                              placeholder="Rumah, Kantor, Gudang, dll"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nama Penerima <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={addressForm.recipient_name}
                              onChange={(e) => setAddressForm({...addressForm, recipient_name: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                              placeholder="Nama lengkap penerima"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nomor Telepon <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              required
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                              placeholder="08xx xxxx xxxx"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Alamat Lengkap <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              required
                              rows={3}
                              value={addressForm.address_line}
                              onChange={(e) => setAddressForm({...addressForm, address_line: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base resize-none"
                              placeholder="Jalan, Nomor, RT/RW, Kelurahan, Kecamatan"
                            />
                          </div>
                          
                          <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kota <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                                placeholder="Nama kota"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Provinsi <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={addressForm.province}
                                onChange={(e) => setAddressForm({...addressForm, province: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                                placeholder="Nama provinsi"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kode Pos
                            </label>
                            <input
                              type="text"
                              value={addressForm.postal_code}
                              onChange={(e) => setAddressForm({...addressForm, postal_code: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                              placeholder="12345"
                            />
                          </div>
                          
                          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddressForm(false);
                                setEditingAddress(null);
                                resetAddressForm();
                              }}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors touch-manipulation min-h-[44px]"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors touch-manipulation min-h-[44px]"
                            >
                              {editingAddress ? 'Simpan Perubahan' : 'Tambah Alamat'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary - Mobile optimized */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
                  {lang.checkout.orderSummary}
                </h3>
                
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <img 
                          src={item.image || "https://placehold.co/64x64/f3f4f6/9ca3af?text=Product"}
                          alt={item.name}
                          className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://placehold.co/64x64/f3f4f6/9ca3af?text=Product";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={generateSEOProductUrl(item.id, item.name)}
                          className="block hover:text-red-600 transition-colors touch-manipulation"
                        >
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{item.name}</h4>
                        </Link>
                        {item.brand && (
                          <p className="text-xs text-gray-500 mt-1">{item.brand}</p>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 space-y-1 sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs sm:text-sm font-semibold text-red-600">
                              {formatRupiah(item.price)}
                              {item.unit && <span className="text-xs text-gray-500">/{item.unit}</span>}
                            </span>
                            {item.category && (
                              <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                {item.category}
                              </span>
                            )}
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600">x{item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-bold text-gray-900">
                          {formatRupiah(item.price * item.quantity)}
                        </div>
                        {item.stock_quantity !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            Stok: {item.stock_quantity}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cartCount} item)</span>
                    <span className="font-medium">{formatRupiah(totalAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkir</span>
                    <span className="text-sm text-orange-600 font-medium">
                      Akan dihitung admin
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-base sm:text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg sm:text-xl font-bold text-red-600">
                      {formatRupiah(totalAmount)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    * Belum termasuk ongkir yang akan dikonfirmasi admin
                  </p>
                </div>
                
                <button
                  onClick={handleSubmitOrder}
                  disabled={!selectedAddressId || isSubmitting || addresses.length === 0 || cartItems.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 sm:py-4 rounded-lg font-semibold transition-colors mt-4 sm:mt-6 flex items-center justify-center space-x-2 touch-manipulation min-h-[44px] text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Memproses Pesanan...</span>
                    </>
                  ) : addresses.length === 0 ? (
                    <span>Tambah Alamat Pengiriman</span>
                  ) : !selectedAddressId ? (
                    <span>Pilih Alamat Pengiriman</span>
                  ) : cartItems.length === 0 ? (
                    <span>Keranjang Kosong</span>
                  ) : (
                    <span>Buat Pesanan ({formatRupiah(totalAmount)})</span>
                  )}
                </button>
                
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Pesanan akan disimpan ke database
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation - Mobile optimized */}
        {currentStep === 'confirmation' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Pesanan Berhasil Dibuat!</h2>
              <p className="text-gray-600 mb-2 text-sm sm:text-base">Terima kasih atas pesanan Anda</p>
              <p className="text-sm text-gray-500 mb-6 sm:mb-8">
                Nomor Pesanan: <span className="font-mono font-semibold text-red-600">{orderNumber}</span>
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Langkah Selanjutnya</h3>
                <div className="text-xs sm:text-sm text-blue-800 space-y-1">
                  <p>✅ Pesanan Anda telah disimpan</p>
                  <p>⏳ Admin akan menghitung ongkir dan menghubungi Anda</p>
                  <p>💳 Lakukan pembayaran sesuai instruksi dari admin</p>
                  <p>📦 Pesanan akan dikirim setelah pembayaran dikonfirmasi</p>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center">
                <button
                  onClick={handleOrderComplete}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors touch-manipulation min-h-[44px] text-sm sm:text-base"
                >
                  Kembali ke Beranda
                </button>
                
                <Link
                  href="/products"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center touch-manipulation min-h-[44px] text-sm sm:text-base"
                >
                  Lanjut Belanja
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage; 