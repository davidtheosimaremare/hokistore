"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  MessageCircle,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  Package
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LangContext';
import { formatRupiah } from '@/utils/formatters';
// Removed duplicate import - will define locally
import Link from 'next/link';

const CartPage = () => {
  const router = useRouter();
  const { lang } = useLang();
  const { cartItems, cartCount, totalAmount, removeFromCart, updateQuantity, clearCart } = useCart();

  // Generate SEO-friendly product URL (consistent with checkout)
  const generateSEOProductUrl = (id: string, name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return `/products/${id}/${slug}`;
  };
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  
  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  // Debug: Log cart data for consistency checking
  React.useEffect(() => {
    console.log('🛒 Cart page data:', {
      cartItems: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        stock_quantity: item.stock_quantity
      })),
      cartCount,
      totalAmount
    });

    // Validate cart data integrity on load
    const invalidItems = cartItems.filter(item => 
      !item.id || !item.name || !item.price || !item.quantity || 
      item.price <= 0 || item.quantity <= 0
    );

    if (invalidItems.length > 0) {
      console.warn('⚠️ Invalid cart items detected:', invalidItems);
    }

    // Check for stock issues
    const stockIssues = cartItems.filter(item => 
      item.stock_quantity !== undefined && item.quantity > item.stock_quantity
    );

    if (stockIssues.length > 0) {
      console.warn('⚠️ Stock quantity issues:', stockIssues.map(item => 
        `${item.name}: needed ${item.quantity}, available ${item.stock_quantity}`
      ));
    }
  }, [cartItems, cartCount, totalAmount]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const result = updateQuantity(productId, newQuantity);
    if (!result.success && result.message) {
      alert(result.message);
    }
  };

  const handleCheckout = () => {
    // Validate cart data before proceeding to checkout
    const invalidItems = cartItems.filter(item => 
      !item.id || !item.name || !item.price || !item.quantity || 
      item.price <= 0 || item.quantity <= 0
    );

    if (invalidItems.length > 0) {
      console.error('Invalid cart items found:', invalidItems);
      alert('Ada item di keranjang yang tidak valid. Silakan hapus dan tambahkan ulang produk tersebut.');
      return;
    }

    // Check if user is logged in for database checkout
    if (window.location.pathname === '/cart') {
      // Redirect to proper checkout page for database order creation
      router.push('/checkout');
      return;
    }

    setShowCheckoutForm(true);
  };

  const handleSubmitOrder = () => {
    setIsCheckingOut(true);
    
    // Create WhatsApp message with order details
    const orderItems = cartItems.map(item => 
      `- ${item.name} (${item.quantity}x) - ${formatRupiah(item.price * item.quantity)}`
    ).join('\n');
    
    const orderMessage = `
Halo, saya ingin melakukan pemesanan:

*DETAIL PESANAN:*
${orderItems}

*TOTAL: ${formatRupiah(totalAmount)}*

*INFORMASI PEMBELI:*
Nama: ${checkoutForm.name}
Email: ${checkoutForm.email}
Telepon: ${checkoutForm.phone}
Alamat: ${checkoutForm.address}, ${checkoutForm.city} ${checkoutForm.postalCode}

${checkoutForm.notes ? `*CATATAN:*\n${checkoutForm.notes}` : ''}

Mohon konfirmasi ketersediaan dan proses pemesanan. Terima kasih!
    `.trim();
    
    // Open WhatsApp with order details
    const whatsappUrl = `https://wa.me/628111086180?text=${encodeURIComponent(orderMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear cart after successful order
    setTimeout(() => {
      clearCart();
      setIsCheckingOut(false);
      setShowCheckoutForm(false);
      router.push('/');
    }, 2000);
  };

  const getWhatsAppLink = (productName: string) => {
    const message = `Halo, saya ingin menanyakan tentang produk: ${productName}`;
    return `https://wa.me/628111086180?text=${encodeURIComponent(message)}`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex items-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors touch-manipulation min-h-[44px] px-2 -ml-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">{lang.common.back || 'Kembali'}</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
            <ShoppingCart className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{lang.cart.emptyCart}</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              {lang.cart.emptyCartMessage}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center bg-red-600 text-white px-6 py-3 sm:py-4 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base touch-manipulation min-h-[44px]"
            >
              <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {lang.cart.viewProducts}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (showCheckoutForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex items-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
            <button
              onClick={() => setShowCheckoutForm(false)}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors touch-manipulation min-h-[44px] px-2 -ml-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">Kembali ke Keranjang</span>
            </button>
          </div>

          <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Informasi Pengiriman</h2>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.name}
                        onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base sm:text-sm"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Nomor Telepon *
                      </label>
                      <input
                        type="tel"
                        required
                        value={checkoutForm.phone}
                        onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base sm:text-sm"
                        placeholder="08xx xxxx xxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base sm:text-sm"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Alamat Lengkap *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base sm:text-sm resize-none"
                      placeholder="Jalan, Nomor, RT/RW, Kelurahan, Kecamatan"
                    />
                  </div>

                  <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kota *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.city}
                        onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base sm:text-sm"
                        placeholder="Nama kota"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kode Pos
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.postalCode}
                        onChange={(e) => setCheckoutForm({...checkoutForm, postalCode: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base sm:text-sm"
                        placeholder="12345"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan Pesanan
                    </label>
                    <textarea
                      rows={3}
                      value={checkoutForm.notes}
                      onChange={(e) => setCheckoutForm({...checkoutForm, notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base sm:text-sm resize-none"
                      placeholder="Catatan khusus untuk pesanan (opsional)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>
                
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate pr-2">
                        {item.name} (x{item.quantity})
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-red-600">
                      {formatRupiah(totalAmount)}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <Link
                      href="/checkout"
                      className="w-full bg-red-600 text-white py-3 sm:py-4 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center space-x-2 touch-manipulation min-h-[44px] text-sm sm:text-base"
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Lanjut ke Checkout</span>
                    </Link>
                    
                    <button
                      onClick={handleSubmitOrder}
                      disabled={isCheckingOut || !checkoutForm.name || !checkoutForm.phone || !checkoutForm.address || !checkoutForm.city}
                      className="w-full bg-green-600 text-white py-3 sm:py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 touch-manipulation min-h-[44px] text-sm sm:text-base"
                    >
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{isCheckingOut ? 'Memproses...' : 'Pesan via WhatsApp'}</span>
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Pesanan akan dikirim melalui WhatsApp untuk konfirmasi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors touch-manipulation min-h-[44px] px-2 -ml-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">Kembali</span>
            </button>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
              <span className="hidden sm:inline">Keranjang Belanja ({cartCount} item)</span>
              <span className="sm:hidden">Keranjang ({cartCount})</span>
            </h1>
          </div>
          
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium touch-manipulation min-h-[44px] px-2"
            >
              <span className="hidden sm:inline">Kosongkan Keranjang</span>
              <span className="sm:hidden">Kosongkan</span>
            </button>
          )}
        </div>

        <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Product Image - Mobile responsive */}
                  <div className="w-full sm:w-20 sm:h-20 h-32 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img 
                      src={item.image || "https://placehold.co/80x80/f3f4f6/9ca3af?text=Product"}
                      alt={item.name}
                      className="w-full h-full sm:w-16 sm:h-16 object-contain rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/80x80/f3f4f6/9ca3af?text=Product";
                      }}
                    />
                  </div>

                  {/* Product Details - Mobile optimized */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={generateSEOProductUrl(item.id, item.name)}
                      className="block hover:text-red-600 transition-colors touch-manipulation"
                    >
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">{item.name}</h3>
                    </Link>
                    
                    {item.brand && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">{item.brand}</p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-2 sm:space-y-0">
                      <span className="text-base sm:text-lg font-bold text-red-600">
                        {formatRupiah(item.price)}
                        {item.unit && <span className="text-xs text-gray-500">/{item.unit}</span>}
                      </span>
                      
                      {item.category && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs w-fit">
                          {item.category}
                        </span>
                      )}
                    </div>
                    
                    {/* Stock Information */}
                    {item.stock_quantity !== undefined && (
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.stock_quantity > 10 ? 'bg-green-100 text-green-700' :
                          item.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          Stok: {item.stock_quantity}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls and Item Total - Mobile layout */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-end sm:space-y-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-10 h-10 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors touch-manipulation"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-12 text-center font-semibold text-sm sm:text-base">{item.quantity}</span>
                      
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.stock_quantity !== undefined && item.quantity >= item.stock_quantity}
                        className="w-10 h-10 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors touch-manipulation"
                        title={item.stock_quantity !== undefined && item.quantity >= item.stock_quantity ? 
                          `Stok maksimal: ${item.stock_quantity}` : 'Tambah quantity'}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total and Remove Button */}
                    <div className="text-right sm:text-center">
                      <p className="text-base sm:text-lg font-bold text-gray-900">
                        {formatRupiah(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 text-sm mt-1 sm:mt-2 flex items-center sm:justify-center touch-manipulation min-h-[44px] px-2 -mr-2 sm:mr-0"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Actions - Mobile optimized */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <Link
                    href={generateSEOProductUrl(item.id, item.name)}
                    className="text-sm text-gray-600 hover:text-red-600 transition-colors touch-manipulation min-h-[44px] flex items-center px-2 -mx-2"
                  >
                    Lihat Detail
                  </Link>
                  <a
                    href={getWhatsAppLink(item.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-700 transition-colors flex items-center touch-manipulation min-h-[44px] px-2 -mx-2"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Tanya Produk
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary - Mobile fixed bottom on small screens */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">{lang.cart.subtotal}</span>
                  <span className="font-medium text-sm sm:text-base">{formatRupiah(totalAmount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">{lang.cart.shipping}</span>
                  <span className="text-xs sm:text-sm text-orange-600 font-medium">
                    {lang.common.loading === 'Loading...' 
                      ? 'Akan dihitung admin' 
                      : 'To be calculated by admin'
                    }
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <span className="text-lg font-semibold text-gray-900">{lang.cart.total}</span>
                  <span className="text-xl font-bold text-red-600">
                    {formatRupiah(totalAmount)}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-4 sm:mb-6">
                  {lang.common.loading === 'Loading...' 
                    ? '* Belum termasuk ongkir yang akan dikonfirmasi admin' 
                    : '* Excluding shipping cost to be confirmed by admin'
                  }
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full bg-red-600 text-white py-3 sm:py-4 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-center block touch-manipulation min-h-[44px] text-sm sm:text-base"
                >
                  {cartItems.length === 0 ? 'Keranjang Kosong' : 
                   `Checkout (${formatRupiah(totalAmount)})`}
                </button>
                
                <p className="text-xs text-center text-gray-500">
                  Data akan disimpan ke database untuk tracking pesanan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage; 