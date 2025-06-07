"use client";

import Link from "next/link";
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube, 
  ArrowUp,
  Zap,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show scroll to top button when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Projects", href: "/projects" },
  ];

  const productLinks = [
    { name: "Siemens", href: "/products/siemens" },
    { name: "G-Comin", href: "/products/g-comin" },
    { name: "Promo", href: "/products/promo" },
  ];

  const supportLinks = [
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Shipping", href: "/shipping" },
    { name: "Warranty", href: "/warranty" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com/hokiindo",
      icon: Facebook,
      hoverColor: "hover:text-blue-500"
    },
    {
      name: "Instagram", 
      href: "https://instagram.com/hokiindo",
      icon: Instagram,
      hoverColor: "hover:text-pink-500"
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/hokiindo",
      icon: Linkedin,
      hoverColor: "hover:text-blue-600"
    },
    {
      name: "YouTube",
      href: "https://youtube.com/hokiindo",
      icon: Youtube,
      hoverColor: "hover:text-red-500"
    },
  ];

  return (
    <>
      <footer className="bg-gray-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
            
            {/* Company Tagline & Info - Takes 2 columns on desktop */}
            <div className="lg:col-span-2 text-center lg:text-left">
              {/* Logo and Tagline */}
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Hokiindo</h3>
                  <p className="text-sm text-gray-400">Electrical Solutions</p>
                </div>
              </div>
              
              {/* Main Tagline */}
              <p className="text-lg font-medium text-gray-300 mb-6 leading-relaxed">
                Solusi Elektrikal Terpercaya untuk Industri Masa Kini
              </p>
              
              {/* Contact Quick Info */}
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+62 21 5555 1234</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@hokiindo.com</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
            </div>

            {/* Company Links */}
            <div className="text-center lg:text-left">
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white hover:underline transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products & Support Links */}
            <div className="text-center lg:text-left">
              {/* Products */}
              <h4 className="text-lg font-semibold text-white mb-4">Products</h4>
              <ul className="space-y-2 mb-6">
                {productLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white hover:underline transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Support */}
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white hover:underline transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              
              {/* Social Media */}
              <div className="flex items-center space-x-6">
                <span className="text-gray-400 text-sm font-medium">Follow Us:</span>
                <div className="flex items-center space-x-4">
                  {socialLinks.map((social) => {
                    const IconComponent = social.icon;
                    return (
                      <Link
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-gray-400 ${social.hoverColor} transition-colors duration-300 transform hover:scale-110`}
                        aria-label={`Follow us on ${social.name}`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-center sm:text-right">
                <p className="text-gray-400 text-sm">
                  Distributor Resmi Siemens Indonesia
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  ISO 9001:2015 Certified
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 Hokiindo. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Designed & Developed with ❤️ for Indonesian Industry
            </p>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </footer>
    </>
  );
} 