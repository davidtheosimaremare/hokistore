"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductList from '@/components/ProductList';

const ProductsListPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Katalog Produk Siemens
            </h1>
            <p className="text-xl text-red-100 mb-6">
              Produk berkualitas tinggi untuk kebutuhan industri Anda
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Ready Stock: Langsung dapat dipesan</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span>Indent: Chat untuk ketersediaan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product List */}
      <ProductList />

      <Footer />
    </div>
  );
};

export default ProductsListPage; 