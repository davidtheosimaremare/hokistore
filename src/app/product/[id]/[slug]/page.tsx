"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Share2, 
  MessageCircle, 
  Plus, 
  Minus,
  Loader2,
  AlertCircle,
  Package,
  Tag,
  Building,
  Info,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
  ThumbsUp,
  ThumbsDown,
  ShoppingCart,
  Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { SupabaseProduct } from '@/hooks/useSupabaseProducts';
import { formatRupiah } from '@/utils/formatters';
import { getDisplayName, getProductCode } from '@/utils/productHelpers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLang();
  const { user } = useAuth();
  const { addToCart, isInCart, getCartItemQuantity } = useCart();
  const productId = params.id as string;

  const [product, setProduct] = useState<SupabaseProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'description' | 'reviews'>('specs');
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  
  // Review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Sample images for slideshow
  const productImages = [
    product?.admin_thumbnail || "https://placehold.co/600x600/f8fafc/64748b?text=Product+Image",
    "https://placehold.co/600x600/f8fafc/64748b?text=Product+View+2",
    "https://placehold.co/600x600/f8fafc/64748b?text=Product+View+3",
    "https://placehold.co/600x600/f8fafc/64748b?text=Product+View+4"
  ];

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          setError(error.message);
          return;
        }

        if (!data) {
          setError('Product not found');
          return;
        }

        setProduct(data);
      } catch (err) {
        setError('Failed to fetch product data');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  // Handle image navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const cartItem = {
        id: product.id.toString(),
        name: getDisplayName(product),
        price: product.price || 0,
        image: product.admin_thumbnail,
        unit: product.unit,
        brand: product.brand,
        category: product.category,
        stock_quantity: product.stock_quantity
      };

      const result = addToCart(cartItem, quantity);
      
      if (result.success) {
        // Show success feedback
        setShowAddedToCart(true);
        setTimeout(() => setShowAddedToCart(false), 2000);
      } else {
        alert(result.message || 'Gagal menambahkan ke keranjang');
      }
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Gagal menambahkan ke keranjang');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!user || !product) return;

    setSubmittingReview(true);
    try {
      const reviewData = {
        user_id: user.id,
        product_id: product.id,
        rating: newReview.rating,
        review_text: newReview.text,
        user_name: user.user_metadata?.full_name || user.email,
        created_at: new Date().toISOString(),
        helpful_count: 0
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReviews(prev => [{ ...reviewData, id: Date.now().toString() }, ...prev]);
      setNewReview({ rating: 5, text: '' });
      
      alert(lang.productDetail.reviewSubmitted);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(lang.productDetail.reviewError);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle WhatsApp contact
  const handleWhatsAppContact = () => {
    if (!product) return;

    const displayName = getDisplayName(product);
    const productCode = getProductCode(product);
    const stockStatus = product.stock_quantity > 0 ? 'Ready Stock' : 'Indent';
    const message = `Halo, saya ingin menanyakan produk:

Nama: ${displayName}
${productCode ? `Kode: ${productCode}` : ''}
Status: ${stockStatus}
${product.category ? `Kategori: ${product.category}` : ''}
Kuantitas: ${quantity}`;

    const whatsappUrl = `https://wa.me/628111086180?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Handle share product
  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: getDisplayName(product),
      text: `${getDisplayName(product)} - ${product.price > 0 ? formatRupiah(product.price) : 'Hubungi untuk harga'}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link produk telah disalin ke clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Get current cart quantity for this product
  const currentCartQuantity = product ? getCartItemQuantity(product.id.toString()) : 0;
  const isProductInCart = product ? isInCart(product.id.toString()) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{lang.productDetail.loadingProduct}</p>
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
        <div className="flex items-center justify-center py-20">
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">{lang.productDetail.productNotFound}</h3>
            <p className="text-red-600 mb-4 text-sm">{lang.productDetail.productNotFoundMessage}</p>
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang.productDetail.backToProducts}</span>
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
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-red-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{getDisplayName(product)}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{lang.productDetail.backToProducts}</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 sm:p-6">
            
            {/* Product Image Slideshow */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={productImages[currentImageIndex]}
                  alt={`${getDisplayName(product)} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Stock Status Badge */}
                <div className="absolute top-4 left-4">
                  {product.stock_quantity > 0 ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                      {lang.productDetail.inStock}
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                      {lang.products.indent}
                    </span>
                  )}
                </div>

                {/* Cart Badge if in cart */}
                {isProductInCart && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center space-x-1">
                      <ShoppingCart className="w-3 h-3" />
                      <span>{currentCartQuantity}</span>
                    </span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {currentImageIndex + 1} / {productImages.length}
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index ? 'border-red-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              
              {/* Product Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {getDisplayName(product)}
                </h1>
                {getProductCode(product) && (
                  <p className="text-gray-600 font-mono text-sm">
                    {lang.productDetail.productNumber}: {getProductCode(product)}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-b border-gray-200 py-4">
                <div className="text-3xl font-bold text-red-600">
                  {product.price > 0 ? formatRupiah(product.price) : lang.products.contactForPrice}
                </div>
                {product.price > 0 && (
                  <p className="text-gray-600 text-sm mt-1">{lang.productDetail.price} per {product.unit || 'unit'}</p>
                )}
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4">
                {product.category && (
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{product.category}</span>
                  </div>
                )}
                {product.brand && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{product.brand}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {product.stock_quantity > 0 ? `${product.stock_quantity} ${product.unit || 'pcs'}` : lang.products.indent}
                  </span>
                </div>
              </div>

              {/* Cart Status */}
              {isProductInCart && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="font-medium">
                      {currentCartQuantity} item dalam keranjang
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity and Actions */}
              <div className="space-y-4">
                
                {product.stock_quantity > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {lang.productDetail.quantity}
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock_quantity}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {lang.productDetail.maxQuantity}: {product.stock_quantity} {product.unit || 'pcs'}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3">
                  
                  {/* Add to Cart Button - Only show if stock > 0 */}
                  {product.stock_quantity > 0 && (
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                        showAddedToCart 
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {addingToCart ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{lang.productDetail.adding}</span>
                        </>
                      ) : showAddedToCart ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>{lang.productDetail.addedToCart}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          <span>{lang.productDetail.addToCart}</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleWhatsAppContact}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{lang.productDetail.askViaWhatsApp}</span>
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>{lang.productDetail.shareProduct}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-lg mt-6 overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('specs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'specs'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {lang.productDetail.specifications}
              </button>
              <button
                onClick={() => setActiveTab('description')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'description'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {lang.productDetail.description}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {lang.productDetail.reviews} ({reviews.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            
            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">{lang.productDetail.specifications}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Product Information</h4>
                    <dl className="space-y-2">
                      {product.brand && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">{lang.productDetail.brand}:</dt>
                          <dd className="font-medium">{product.brand}</dd>
                        </div>
                      )}
                      {product.model && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">{lang.productDetail.model}:</dt>
                          <dd className="font-medium">{product.model}</dd>
                        </div>
                      )}
                      {product.category && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">{lang.productDetail.category}:</dt>
                          <dd className="font-medium">{product.category}</dd>
                        </div>
                      )}
                      {getProductCode(product) && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">{lang.productDetail.productNumber}:</dt>
                          <dd className="font-medium font-mono">{getProductCode(product)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Stock & Availability</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">{lang.productDetail.stock}:</dt>
                        <dd className="font-medium">
                          {product.stock_quantity > 0 ? `${product.stock_quantity} ${product.unit || 'pcs'}` : lang.products.indent}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Status:</dt>
                        <dd className={`font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {product.stock_quantity > 0 ? lang.productDetail.inStock : lang.products.indent}
                        </dd>
                      </div>
                      {product.price > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">{lang.productDetail.price}:</dt>
                          <dd className="font-medium text-red-600">{formatRupiah(product.price)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{lang.productDetail.description}</h3>
                
                {product.description && product.description.trim() ? (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 italic">
                      {lang.productDetail.descriptionPlaceholder}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">{lang.productDetail.reviews}</h3>

                {/* Write Review Section */}
                {user ? (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">{lang.productDetail.writeReview}</h4>
                    
                    <div className="space-y-4">
                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {lang.productDetail.rating}
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                              className="p-1"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= newReview.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {lang.productDetail.reviewText}
                        </label>
                        <textarea
                          value={newReview.text}
                          onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                          placeholder={lang.productDetail.reviewPlaceholder}
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview || !newReview.text.trim()}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        {submittingReview ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{lang.productDetail.submittingReview}</span>
                          </>
                        ) : (
                          <span>{lang.productDetail.submitReview}</span>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-4">{lang.productDetail.loginToReview}</p>
                    <Link
                      href="/login"
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {lang.auth.loginButton}
                    </Link>
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{review.user_name}</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{review.review_text}</p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{lang.productDetail.helpful}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                            <ThumbsDown className="w-4 h-4" />
                            <span>{lang.productDetail.notHelpful}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">{lang.productDetail.noReviews}</h4>
                    <p className="text-gray-600">{lang.productDetail.beFirstReviewer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage; 