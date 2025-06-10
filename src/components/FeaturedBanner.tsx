"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';
import { AccurateProduct } from '@/services/accurateApi';
import { formatRupiah } from '@/utils/formatters';
import Link from 'next/link';

interface FeaturedBannerProps {
  products: AccurateProduct[];
}

const FeaturedBanner: React.FC<FeaturedBannerProps> = ({ products }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Touch/Swipe states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Get 3 random featured products
  const featuredProducts = React.useMemo(() => {
    if (products.length <= 3) return products;
    
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [products]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || featuredProducts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredProducts.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Touch/Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && featuredProducts.length > 1) {
      nextSlide();
    }
    if (isRightSwipe && featuredProducts.length > 1) {
      prevSlide();
    }
  };

  if (featuredProducts.length === 0) {
    return (
      <div className="relative bg-gradient-to-r from-red-600 to-red-800 rounded-xl overflow-hidden h-64 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Produk Unggulan</h2>
          <p className="text-red-100">Sedang memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative bg-gradient-to-r from-red-600 to-red-800 rounded-xl overflow-hidden h-64 md:h-80"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-red-800/90" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Side - Product Info */}
            <div className="text-white">
              <div className="flex items-center space-x-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-red-100 uppercase tracking-wider">
                  Produk Unggulan
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {featuredProducts[currentSlide]?.name}
              </h1>
              
              <div className="space-y-3 mb-6">
                {featuredProducts[currentSlide]?.shortName && (
                  <p className="text-red-100">
                    {featuredProducts[currentSlide].shortName}
                  </p>
                )}
                
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-yellow-400">
                    {formatRupiah(featuredProducts[currentSlide]?.unitPrice || 0)}
                  </span>
                  
                  {featuredProducts[currentSlide]?.itemCategory?.name && (
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                      {featuredProducts[currentSlide].itemCategory.name}
                    </span>
                  )}
                </div>
              </div>
              
              <Link 
                href={`/product/${featuredProducts[currentSlide]?.id}`}
                className="inline-flex items-center bg-white text-red-600 font-bold px-6 py-3 rounded-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span>Lihat Detail</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              
              {/* Mobile Swipe Indicator */}
              {featuredProducts.length > 1 && (
                <div className="md:hidden mt-4 flex items-center text-white/70 text-xs">
                  <span>← Geser untuk slide →</span>
                </div>
              )}
            </div>

            {/* Right Side - Product Visual */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-48 h-48 md:w-64 md:h-64 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                  <img 
                    src="https://placehold.co/300x300/ffffff/dc2626?text=Product"
                    alt={featuredProducts[currentSlide]?.name}
                    className="w-32 h-32 md:w-40 md:h-40 object-contain"
                  />
                </div>
                
                {/* Stock Badge */}
                <div className="absolute -top-2 -right-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    (featuredProducts[currentSlide]?.stock || featuredProducts[currentSlide]?.balance || 0) > 0
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-500 text-black'
                  }`}>
                    {(featuredProducts[currentSlide]?.stock || featuredProducts[currentSlide]?.balance || 0) > 0 
                      ? 'Tersedia' 
                      : 'Indent'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Desktop Only */}
      {featuredProducts.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextSlide}
            className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {featuredProducts.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {featuredProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedBanner; 