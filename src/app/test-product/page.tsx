"use client";

import React from 'react';
import { useLang } from '@/context/LangContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const TestProductPage = () => {
  const { lang, currentLang, setLang } = useLang();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Test Multi-Language Labels</h1>
          
          {/* Language Switcher */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Current Language: {currentLang}</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setLang('id')}
                className={`px-4 py-2 rounded ${currentLang === 'id' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Bahasa Indonesia
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-2 rounded ${currentLang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                English
              </button>
            </div>
          </div>

          {/* Test Labels */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Labels Test:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><strong>Indent (ID):</strong> {lang.products.indent}</p>
                  <p><strong>In Stock:</strong> {lang.products.inStock}</p>
                  <p><strong>Contact for Price:</strong> {lang.products.contactForPrice}</p>
                  <p><strong>Product Code:</strong> {lang.products.productCode}</p>
                </div>
                <div className="space-y-2">
                  <p><strong>All Products:</strong> {lang.products.allProducts}</p>
                  <p><strong>Search Results:</strong> {lang.products.searchResults}</p>
                  <p><strong>Load More:</strong> {lang.products.loadMore}</p>
                  <p><strong>Stock:</strong> {lang.products.stock}</p>
                </div>
              </div>
            </div>

            {/* Sample Cards */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Sample Product Status:</h3>
              <div className="flex space-x-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {lang.products.stock}: 10 pcs
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  {lang.products.indent}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Link 
                href="/products" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Test on Products Page
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TestProductPage; 