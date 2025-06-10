"use client";

import React, { useState } from 'react';
import { ShoppingCart, MessageCircle, Search, Filter } from 'lucide-react';
import { useSupabaseProducts, SupabaseProduct } from '@/hooks/useSupabaseProducts';
import { formatRupiah } from '@/utils/formatters';
import { getDisplayName, getProductCode } from '@/utils/productHelpers';

const ProductList = () => {
  const { products, categories, loading, error } = useSupabaseProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const displayName = getDisplayName(product);
    const productCode = getProductCode(product);
    
    const matchesSearch = searchTerm === '' || 
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (productCode && productCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getWhatsAppLink = (product: SupabaseProduct) => {
    const displayName = getDisplayName(product);
    const productCode = getProductCode(product);
    const stockStatus = product.stock_quantity > 0 ? 'Ready Stock' : 'Indent';
    const message = `Halo, saya ingin menanyakan ketersediaan produk:

Nama: ${displayName}
${productCode ? `Kode: ${productCode}` : ''}
Status: ${stockStatus}
${product.category ? `Kategori: ${product.category}` : ''}

${product.stock_quantity <= 0 ? 'Mohon informasi untuk stock dan waktu pengiriman.' : 'Mohon informasi lebih lanjut.'}`;
    
    return `https://wa.me/628111086180?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Terjadi Kesalahan</h3>
          <p className="text-red-600 mb-4 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Daftar Produk ({filteredProducts.length})
        </h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama atau kode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white min-w-[200px]"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
          <p className="text-gray-600">Coba ubah kata kunci pencarian atau filter kategori</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="aspect-square w-full relative overflow-hidden bg-gray-50">
                <img 
                  src={product.admin_thumbnail || "https://placehold.co/400x400/f8fafc/64748b?text=Product+Image"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Product Content */}
              <div className="p-4">
                {/* Product Name */}
                <h3 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2 leading-tight min-h-[40px]">
                  {getDisplayName(product)}
                </h3>
                
                {/* Category */}
                {product.category && (
                  <p className="text-xs text-gray-600 mb-1">
                    Kategori: {product.category}
                  </p>
                )}
                
                {/* Product Code */}
                {getProductCode(product) && (
                  <p className="text-xs font-mono text-gray-500 mb-2 bg-gray-50 px-2 py-1 rounded">
                    Kode: {getProductCode(product)}
                  </p>
                )}
                
                {/* Price */}
                <div className="mb-3">
                  <span className="text-lg font-bold text-red-600">
                    {product.price > 0 ? formatRupiah(product.price) : 'Hubungi untuk harga'}
                  </span>
                </div>
                
                {/* Stock Status */}
                <div className="mb-4">
                  {product.stock_quantity > 0 ? (
                    <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                      Stok: {product.stock_quantity} {product.unit || 'pcs'}
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                      Indent
                    </span>
                  )}
                </div>
                
                {/* Action Button */}
                <div>
                  {product.stock_quantity > 0 ? (
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Tambah ke Keranjang</span>
                    </button>
                  ) : (
                    <a 
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat untuk Stock</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList; 