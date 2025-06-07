"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, MessageCircle, Trash2 } from 'lucide-react';
import { AccurateProduct } from '@/services/accurateApi';
import { formatRupiah } from '@/utils/formatters';
import { useLang } from '@/context/LangContext';

interface ProductCardProps {
  product: AccurateProduct;
  viewMode: 'grid' | 'list';
  onAddToCart: (product: AccurateProduct) => void;
  getWhatsAppLink: (product: AccurateProduct) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode, 
  onAddToCart, 
  getWhatsAppLink 
}) => {
  const { lang } = useLang();
  const hasStock = (product.stock || product.balance || 0) > 0;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-150">
        <div className="flex items-center space-x-4">
          {/* Product Image */}
          <div className="relative w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
            <img 
              src="https://placehold.co/64x64/f3f4f6/9ca3af?text=IMG"
              alt={product.name}
              className="w-12 h-12 object-contain"
            />
            <div className="absolute -top-1 -right-1">
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                hasStock ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
              }`}>
                {hasStock ? lang.products.inStock : 'Indent'}
              </span>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <Link 
              href={`/product/${product.id}`}
              className="block hover:text-red-600 transition-colors"
            >
              <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</h3>
            </Link>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-red-600">
                  {formatRupiah(product.unitPrice || 0)}
                </span>
                
                {(product.itemCategory?.name || product.itemTypeName) && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {product.itemCategory?.name || product.itemTypeName}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {hasStock ? (
                  <button
                    onClick={() => onAddToCart(product)}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors text-xs font-medium flex items-center space-x-1"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>{lang.products.addToCart}</span>
                  </button>
                ) : (
                  <a
                    href={getWhatsAppLink(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors text-xs font-medium flex items-center space-x-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Chat</span>
                  </a>
                )}
                
                <Link
                  href={`/product/${product.id}`}
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium"
                >
                  {lang.products.viewDetails}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-150 group">
      <div className="relative aspect-square bg-gray-100">
        <img 
          src="https://placehold.co/240x240/f3f4f6/9ca3af?text=IMG"
          alt={product.name}
          className="w-full h-full object-contain p-3"
        />
        
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            hasStock ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
          }`}>
            {hasStock ? lang.products.inStock : 'Indent'}
          </span>
        </div>
      </div>
      
      <div className="p-3">
        <Link 
          href={`/product/${product.id}`}
          className="block hover:text-red-600 transition-colors"
        >
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2 leading-tight">
            {product.name}
          </h3>
        </Link>
        
        {product.shortName && product.shortName !== product.name && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">{product.shortName}</p>
        )}
        
        {(product.itemCategory?.name || product.itemTypeName) && (
          <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs mb-2">
            {product.itemCategory?.name || product.itemTypeName}
          </span>
        )}
        
        <div className="mb-3">
          <span className="text-lg font-bold text-red-600">
            {formatRupiah(product.unitPrice || 0)}
          </span>
        </div>

        <div className="space-y-2">
          {hasStock ? (
            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{lang.products.addToCart}</span>
            </button>
          ) : (
            <a
              href={getWhatsAppLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat untuk Stok</span>
            </a>
          )}
          
          <Link
            href={`/product/${product.id}`}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium text-center block"
          >
            {lang.products.viewDetails}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 