"use client";

import React from "react";
import { Zap, Settings, Shield, Package } from "lucide-react";

const FontDemo = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Font Terbaik untuk Toko Online Kelistrikan
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 font-medium">
          Perbandingan font yang cocok untuk industri teknik dan kelistrikan
        </p>
      </div>

      {/* Current Font - Montserrat */}
      <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-red-200">
        <div className="flex items-center mb-6">
          <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mr-4">
            AKTIF
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-red-600">Montserrat (Font Utama)</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight">Hokiindo Raya</h3>
            <p className="text-xl md:text-2xl text-blue-600 mb-3 font-semibold">Your Trusted Solution Partner</p>
            <p className="text-base md:text-lg text-gray-600 mb-6 font-medium leading-relaxed">
              Kami menyediakan produk kelistrikan industri berkualitas tinggi dengan teknologi terdepan 
              untuk semua kebutuhan automation dan control system Anda.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center bg-gray-100 px-4 py-3 rounded-lg">
                <Zap className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm font-semibold">Automation</span>
              </div>
              <div className="flex items-center bg-gray-100 px-4 py-3 rounded-lg">
                <Settings className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm font-semibold">Control</span>
              </div>
              <div className="flex items-center bg-gray-100 px-4 py-3 rounded-lg">
                <Shield className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm font-semibold">Safety</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-3">✅ Keunggulan Montserrat:</h4>
              <ul className="text-sm text-gray-600 space-y-2 font-medium">
                <li>• Geometric sans-serif yang modern dan clean</li>
                <li>• Excellent readability di semua ukuran</li>
                <li>• Professional dan trustworthy appearance</li>
                <li>• Perfect untuk tech/engineering industry</li>
                <li>• Multiple weights tersedia (300-800)</li>
                <li>• Optimized untuk web dan print</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Font Alternatives */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Inter */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Inter - Modern Technical
          </h3>
          <div style={{ fontFamily: 'Inter, sans-serif' }}>
            <p className="text-lg font-semibold text-gray-800 mb-2">Hokiindo Raya</p>
            <p className="text-gray-600 mb-4">
              Distributor produk Siemens dengan kualitas terbaik untuk industri modern.
            </p>
            <div className="text-sm text-gray-500">
              Font yang designed specifically untuk UI, sangat readable di layar.
            </div>
          </div>
        </div>

        {/* Roboto */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Roboto - Industrial Feel
          </h3>
          <div style={{ fontFamily: 'Roboto, sans-serif' }}>
            <p className="text-lg font-semibold text-gray-800 mb-2">Hokiindo Raya</p>
            <p className="text-gray-600 mb-4">
              Distributor produk Siemens dengan kualitas terbaik untuk industri modern.
            </p>
            <div className="text-sm text-gray-500">
              Font yang mechanical yet friendly, cocok untuk technical documentation.
            </div>
          </div>
        </div>

        {/* Source Sans Pro */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Source Sans Pro, sans-serif' }}>
            Source Sans Pro - Corporate
          </h3>
          <div style={{ fontFamily: 'Source Sans Pro, sans-serif' }}>
            <p className="text-lg font-semibold text-gray-800 mb-2">Hokiindo Raya</p>
            <p className="text-gray-600 mb-4">
              Distributor produk Siemens dengan kualitas terbaik untuk industri modern.
            </p>
            <div className="text-sm text-gray-500">
              Font Adobe yang clean dan neutral, excellent untuk corporate use.
            </div>
          </div>
        </div>

        {/* Open Sans */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Open Sans - Friendly
          </h3>
          <div style={{ fontFamily: 'Open Sans, sans-serif' }}>
            <p className="text-lg font-semibold text-gray-800 mb-2">Hokiindo Raya</p>
            <p className="text-gray-600 mb-4">
              Distributor produk Siemens dengan kualitas terbaik untuk industri modern.
            </p>
            <div className="text-sm text-gray-500">
              Humanist sans-serif yang warm dan approachable namun tetap professional.
            </div>
          </div>
        </div>
      </div>

      {/* Typography Scale Demo */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-100">
        <h3 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6 flex items-center">
          <Package className="w-8 h-8 mr-3" />
          Montserrat Typography Scale
        </h3>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-6xl font-bold text-gray-900 mb-2">Heading 1</h1>
            <p className="text-sm text-gray-500 font-medium">text-6xl font-bold - Untuk main heading</p>
          </div>
          
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Heading 2</h2>
            <p className="text-sm text-gray-500 font-medium">text-4xl font-bold - Untuk section heading</p>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Heading 3</h3>
            <p className="text-sm text-gray-500 font-medium">text-2xl font-semibold - Untuk subsection</p>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-800 mb-2">Body Large</p>
            <p className="text-sm text-gray-500 font-medium">text-lg font-medium - Untuk intro text</p>
          </div>
          
          <div>
            <p className="text-base font-normal text-gray-700 mb-2">Body Regular</p>
            <p className="text-sm text-gray-500 font-medium">text-base font-normal - Untuk body text</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Small Text</p>
            <p className="text-sm text-gray-500 font-medium">text-sm font-medium - Untuk captions dan labels</p>
          </div>
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8 rounded-xl border border-red-100">
        <h3 className="text-2xl md:text-3xl font-bold text-red-800 mb-6 flex items-center">
          <Package className="w-8 h-8 mr-3" />
          Tips Implementasi Montserrat untuk Toko Online Kelistrikan
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-bold text-red-700 mb-3">✨ Best Practices:</h4>
            <ul className="space-y-2 text-gray-700 font-medium">
              <li>• <strong>Font weights:</strong> Gunakan 400, 500, 600, 700 untuk hierarchy</li>
              <li>• <strong>Line height:</strong> 1.5-1.6 untuk optimal readability</li>
              <li>• <strong>Letter spacing:</strong> Default spacing sudah optimal</li>
              <li>• <strong>Contrast:</strong> Minimum 4.5:1 untuk accessibility</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold text-red-700 mb-3">⚡ Untuk Industri Kelistrikan:</h4>
            <ul className="space-y-2 text-gray-700 font-medium">
              <li>• <strong>Professional appearance:</strong> Geometric sans-serif</li>
              <li>• <strong>Technical credibility:</strong> Clean dan modern</li>
              <li>• <strong>Multi-language:</strong> Support bahasa Indonesia dengan baik</li>
              <li>• <strong>Web performance:</strong> Optimized loading</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Load additional fonts for demo */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Source+Sans+Pro:wght@300;400;600;700&family=Open+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    </div>
  );
};

export default FontDemo; 