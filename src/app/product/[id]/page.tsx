"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShoppingCart, 
  MessageCircle, 
  Loader2, 
  Package, 
  Tag, 
  DollarSign,
  Building,
  Hash,
  Info,
  Plus,
  Minus,
  Share2,
  Heart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AccurateApiService, AccurateProduct } from '@/services/accurateApi';
import { formatRupiah } from '@/utils/formatters';
import { useCart } from '@/context/CartContext';

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string);
  
  const [product, setProduct] = useState<AccurateProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<AccurateProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const { addToCart } = useCart();

  // Mock product images (since we don't have real images from API)
  const productImages = [
    "https://placehold.co/800x800/f3f4f6/9ca3af?text=Product+Main",
    "https://placehold.co/800x800/f3f4f6/9ca3af?text=Product+Detail+1",
    "https://placehold.co/800x800/f3f4f6/9ca3af?text=Product+Detail+2",
    "https://placehold.co/800x800/f3f4f6/9ca3af?text=Product+Detail+3"
  ];

  // Load product detail and related products
  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Loading product detail for ID:', productId);
        
        // First try to get specific product detail
        let productData = null;
        try {
          productData = await AccurateApiService.getProductDetail(productId);
          console.log('✅ Got product detail from detail API:', productData);
        } catch (detailError) {
          console.log('⚠️ Detail API failed, trying to find in product list:', detailError);
          
          // Fallback: Get from product list
          try {
            const allProducts = await AccurateApiService.getAllProducts(50);
            productData = allProducts.find(p => p.id === productId);
            console.log('✅ Found product in list:', productData);
          } catch (listError) {
            console.log('⚠️ List API also failed, trying Siemens products:', listError);
            
            // Second fallback: Try Siemens products
            try {
              const siemensProducts = await AccurateApiService.getSiemensProducts(50);
              productData = siemensProducts.find(p => p.id === productId);
              console.log('✅ Found product in Siemens list:', productData);
            } catch (siemensError) {
              console.log('❌ All APIs failed:', siemensError);
            }
          }
        }
        
        // Get related products
        const relatedData = await AccurateApiService.getSiemensProducts(4).catch(() => []);
        
        if (productData) {
          setProduct(productData);
          setRelatedProducts(relatedData.filter(p => p.id !== productId));
          console.log('✅ Successfully loaded product:', productData.name);
        } else {
          setError('Produk tidak ditemukan di sistem');
        }
        
      } catch (err) {
        console.error('❌ Error loading product data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    if (productId && !isNaN(productId)) {
      loadProductData();
    } else {
      setError('ID produk tidak valid');
      setLoading(false);
    }
  }, [productId]);

  // Handle add to cart with notification
  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      addToCart(product, quantity);
      
      // Show success notification
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  // Get WhatsApp link for inquiry
  const getWhatsAppLink = () => {
    if (!product) return '#';
    
    const message = `Halo, saya tertarik dengan produk: ${product.name} (ID: ${product.id}). Bisakah Anda memberikan informasi lebih lanjut tentang ketersediaan stok dan detail produk?`;
    return `https://wa.me/628111086180?text=${encodeURIComponent(message)}`;
  };

  // Image navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const hasStock = (product?.stock || product?.balance || 0) > 0;
  const stockCount = product?.stock || product?.balance || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat detail produk...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-800 mb-2">Produk Tidak Ditemukan</h2>
              <p className="text-red-600 mb-4">{error || 'Produk yang Anda cari tidak tersedia'}</p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => router.back()}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={() => router.push('/products')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Lihat Semua Produk
                </button>
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
      
      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>Produk berhasil ditambahkan ke keranjang!</span>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6 text-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </button>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600">Produk</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product Images - Left Side */}
          <div className="lg:col-span-6">
            <div className="sticky top-4">
              {/* Main Image */}
              <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
                <div className="aspect-square bg-gray-50 flex items-center justify-center">
                  <img
                    src={productImages[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-contain p-8"
                  />
                </div>
                
                {/* Stock Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-2 rounded-full text-sm font-bold shadow-md ${
                    hasStock ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {hasStock ? `${stockCount} Tersedia` : 'Indent'}
                  </span>
                </div>

                {/* Image Navigation */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-red-500' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all ${
                      index === currentImageIndex ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Information - Right Side */}
          <div className="lg:col-span-6 space-y-6">
            {/* Product Title & Rating */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 hover:text-red-600'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              {product.shortName && product.shortName !== product.name && (
                <p className="text-lg text-gray-600 mb-4">
                  {product.shortName}
                </p>
              )}

              {/* Product Rating & Reviews */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8/5 • 127 ulasan)</span>
                <span className="text-sm text-green-600 font-medium">✓ Terpercaya</span>
              </div>

              {/* Product Code & Category */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Hash className="w-4 h-4 mr-1" />
                  <span>SKU: {product.id}</span>
                </div>
                {product.no && (
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    <span>{product.no}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {formatRupiah(product.unitPrice || 0)}
                  </div>
                  {product.unit1Name && (
                    <p className="text-sm text-gray-600">
                      per {product.unit1Name}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                    Harga Terbaik
                  </div>
                  <div className="text-sm text-gray-500">
                    Gratis konsultasi
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">Garansi Resmi</div>
                <div className="text-xs text-gray-500">Original Siemens</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">Gratis Ongkir</div>
                <div className="text-xs text-gray-500">Jabodetabek</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">Siap Kirim</div>
                <div className="text-xs text-gray-500">Same day</div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              {hasStock ? (
                <div className="space-y-6">
                  {/* Quantity Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Jumlah Pembelian
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-l-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <input
                          type="number"
                          min="1"
                          max={stockCount}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 text-center border-0 focus:ring-0 h-12"
                        />
                        
                        <button
                          onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                          className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-r-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <span className="text-sm text-gray-500">
                        Stok: {stockCount} unit
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="bg-red-600 text-white py-4 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-5 h-5" />
                      )}
                      <span>
                        {addingToCart ? 'Loading...' : 'Keranjang'}
                      </span>
                    </button>
                    
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 font-semibold"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Chat</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-amber-800 mb-2">Produk Indent</h4>
                    <p className="text-amber-700 text-sm">
                      Produk tersedia dengan sistem indent. Hubungi kami untuk informasi leadtime.
                    </p>
                  </div>
                  
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 font-semibold"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Konsultasi Ketersediaan</span>
                  </a>
                </div>
              )}

              {/* Additional Actions */}
              <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: `Lihat produk: ${product.name}`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Bagikan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'description', label: 'Deskripsi', icon: Info },
                { id: 'specifications', label: 'Spesifikasi', icon: Package },
                { id: 'warehouse', label: 'Ketersediaan', icon: Building },
                { id: 'reviews', label: 'Ulasan (127)', icon: Star }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-4">Deskripsi Produk</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {product.description || `${product.name} adalah produk berkualitas tinggi dari Siemens yang dirancang untuk memenuhi kebutuhan industri modern. Produk ini telah teruji dan memiliki standar kualitas internasional.`}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold mb-2">Keunggulan Produk:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Kualitas terjamin dari Siemens</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Garansi resmi distributor</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Support teknis 24/7</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Instalasi dan commissioning</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Aplikasi:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Sistem otomasi industri</li>
                      <li>• Kontrol motor dan switching</li>
                      <li>• Panel distribusi listrik</li>
                      <li>• Sistem monitoring dan kontrol</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Spesifikasi Teknis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <dt className="text-sm font-medium text-gray-500">Kategori Produk</dt>
                      <dd className="text-gray-900">{product.itemCategory?.name || 'Electrical Components'}</dd>
                    </div>
                    
                    <div className="border-l-4 border-red-500 pl-4">
                      <dt className="text-sm font-medium text-gray-500">Tipe Item</dt>
                      <dd className="text-gray-900">{product.itemTypeName || 'Industrial Component'}</dd>
                    </div>
                    
                    <div className="border-l-4 border-red-500 pl-4">
                      <dt className="text-sm font-medium text-gray-500">Unit Pengukuran</dt>
                      <dd className="text-gray-900">{product.unit1Name || 'Piece'}</dd>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <dt className="text-sm font-medium text-gray-500">Product ID</dt>
                      <dd className="text-gray-900">{product.id}</dd>
                    </div>
                    
                    {product.no && (
                      <div className="border-l-4 border-blue-500 pl-4">
                        <dt className="text-sm font-medium text-gray-500">Part Number</dt>
                        <dd className="text-gray-900">{product.no}</dd>
                      </div>
                    )}
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-gray-900">
                        {product.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'warehouse' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Ketersediaan Stok</h3>
                {product.detailWarehouseData && product.detailWarehouseData.length > 0 ? (
                  <div className="grid gap-4">
                    {product.detailWarehouseData.map((warehouse, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <h4 className="font-medium text-gray-900">{warehouse.warehouseName}</h4>
                              {warehouse.defaultWarehouse && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Gudang Utama
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              Status: {warehouse.suspended ? 
                                <span className="text-red-600 font-medium">Tidak Aktif</span> : 
                                <span className="text-green-600 font-medium">Aktif</span>
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              {warehouse.balance}
                            </div>
                            <div className="text-sm text-gray-500">
                              {warehouse.balanceUnit}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Informasi gudang tidak tersedia</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Ulasan Pelanggan</h3>
                
                {/* Review Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-3xl font-bold">4.8</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">Berdasarkan 127 ulasan</p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-medium mb-1">98% Merekomendasikan</div>
                      <div className="text-sm text-gray-500">Produk berkualitas tinggi</div>
                    </div>
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-6">
                  {[
                    {
                      name: "PT. Astra International",
                      rating: 5,
                      date: "2 minggu lalu",
                      comment: "Kualitas produk sangat baik, pengiriman cepat dan packaging aman. Team support juga sangat responsif."
                    },
                    {
                      name: "PT. Pertamina",
                      rating: 5,
                      date: "1 bulan lalu", 
                      comment: "Sudah beberapa kali order disini, selalu puas dengan kualitas dan pelayanannya. Highly recommended!"
                    },
                    {
                      name: "PT. PLN",
                      rating: 4,
                      date: "2 bulan lalu",
                      comment: "Produk sesuai spesifikasi, harga kompetitif. Akan order lagi untuk project selanjutnya."
                    }
                  ].map((review, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-medium text-gray-900">{review.name}</h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-4 h-4 ${
                                    star <= review.rating 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                        </div>
                        <Award className="w-5 h-5 text-blue-500" />
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Produk Terkait</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-square bg-gray-50 p-4">
                    <img
                      src="https://placehold.co/300x300/f3f4f6/9ca3af?text=Product"
                      alt={relatedProduct.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="text-lg font-bold text-red-600 mb-3">
                      {formatRupiah(relatedProduct.unitPrice || 0)}
                    </div>
                    <button
                      onClick={() => router.push(`/product/${relatedProduct.id}`)}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage; 