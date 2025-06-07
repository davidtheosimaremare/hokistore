"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  CreditCard,
  Building,
  Calculator,
  Shield,
  CheckCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LangContext';
import { formatRupiah } from '@/utils/formatters';

interface CheckoutForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  paymentMethod: 'bca' | 'manual';
}

const CheckoutPage = () => {
  const router = useRouter();
  const { state: cartState, clearCart } = useCart();
  const { lang } = useLang();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'bca'
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cartState.items.length === 0) {
      router.push('/cart');
    }
  }, [cartState.items.length, router]);

  // Calculate prices with PPN 11%
  const subtotal = cartState.totalPrice;
  const ppnRate = 0.11; // 11% PPN
  const ppnAmount = subtotal * ppnRate;
  const totalAfterPPN = subtotal + ppnAmount;

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return form.name && form.phone && form.address && form.city;
  };

  const handleSubmitOrder = async () => {
    if (!isFormValid()) return;
    
    setIsProcessing(true);

    try {
      // Prepare order details
      const orderDetails = cartState.items.map(item => 
        `• ${item.name} (x${item.quantity}) - ${formatRupiah(item.unitPrice * item.quantity)}`
      ).join('\n');

      const paymentInfo = form.paymentMethod === 'bca' 
        ? '💳 *Metode Pembayaran:* Transfer BCA\n📊 *Rekening:* 1234567890 a.n. Hokiindo Raya\n'
        : '💰 *Metode Pembayaran:* Manual/Cash\n';

      const shippingInfo = `📍 *Alamat Pengiriman:*
${form.address}
${form.city}${form.postalCode ? `, ${form.postalCode}` : ''}`;

      const orderMessage = `🛒 *PESANAN BARU - HOKISTORE*

👤 *Data Pelanggan:*
Nama: ${form.name}
Telepon: ${form.phone}
${form.email ? `Email: ${form.email}` : ''}

${shippingInfo}

📦 *Detail Pesanan:*
${orderDetails}

💰 *Ringkasan Pembayaran:*
Subtotal: ${formatRupiah(subtotal)}
PPN 11%: ${formatRupiah(ppnAmount)}
*Total: ${formatRupiah(totalAfterPPN)}*

${paymentInfo}

🚚 *Ongkos Kirim:* Akan dihitung dan dikonfirmasi admin

${form.notes ? `📝 *Catatan:* ${form.notes}` : ''}

---
Mohon konfirmasi ketersediaan barang dan total pembayaran final (termasuk ongkir).

Terima kasih! 🙏`;

      // Send to WhatsApp
      const whatsappUrl = `https://wa.me/628111086180?text=${encodeURIComponent(orderMessage)}`;
      window.open(whatsappUrl, '_blank');

      // Clear cart and redirect
      setTimeout(() => {
        clearCart();
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">Redirecting to cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{lang.checkout.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                {lang.checkout.shippingInfo}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    {lang.checkout.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={lang.checkout.fullNamePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {lang.checkout.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={lang.checkout.phonePlaceholder}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  {lang.checkout.email}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={lang.checkout.emailPlaceholder}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {lang.checkout.address} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={lang.checkout.addressPlaceholder}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang.checkout.city} *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={lang.checkout.cityPlaceholder}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang.checkout.postalCode}
                  </label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={lang.checkout.postalCodePlaceholder}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang.checkout.orderNotes}
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={lang.checkout.orderNotesPlaceholder}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-red-600" />
                Metode Pembayaran
              </h3>
              
              <div className="space-y-4">
                {/* BCA Transfer */}
                <div className="border rounded-lg p-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bca"
                      checked={form.paymentMethod === 'bca'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <Building className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="font-medium text-gray-900">Transfer Bank BCA</span>
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Recommended</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Transfer ke rekening BCA. Detail rekening akan diberikan setelah konfirmasi pesanan.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Manual Payment */}
                <div className="border rounded-lg p-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="manual"
                      checked={form.paymentMethod === 'manual'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2 text-gray-600" />
                        <span className="font-medium text-gray-900">Pembayaran Manual</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Koordinasi pembayaran langsung dengan admin via WhatsApp.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>
              
              {/* Items */}
              <div className="space-y-3 mb-4">
                {cartState.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 flex-1">
                      {item.name} <span className="text-gray-400">(x{item.quantity})</span>
                    </span>
                    <span className="font-medium ml-2">
                      {formatRupiah(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatRupiah(subtotal)}</span>
                </div>
                
                {/* PPN */}
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Calculator className="w-4 h-4 mr-1" />
                    PPN 11%
                  </span>
                  <span className="font-medium">{formatRupiah(ppnAmount)}</span>
                </div>
                
                {/* Shipping */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Ongkos Kirim</span>
                  <span className="text-sm text-orange-600 font-medium">
                    Akan dihitung admin
                  </span>
                </div>
                
                {/* Total */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-red-600">{formatRupiah(totalAfterPPN)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    * Belum termasuk ongkir
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              {form.paymentMethod === 'bca' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <Shield className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Info Pembayaran BCA</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Detail rekening dan instruksi pembayaran akan dikirim via WhatsApp setelah konfirmasi pesanan.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  onClick={handleSubmitOrder}
                  disabled={!isFormValid() || isProcessing}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>
                    {isProcessing 
                      ? (lang.checkout.processing || 'Memproses...') 
                      : (lang.checkout.orderViaMhatsApp || 'Pesan via WhatsApp')
                    }
                  </span>
                </button>
                
                <p className="text-xs text-gray-500 mt-3 text-center">
                  {lang.checkout.orderWillBeSent || 'Pesanan akan dikirim melalui WhatsApp untuk konfirmasi'}
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

export default CheckoutPage; 