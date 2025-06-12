"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  ExternalLink
} from "lucide-react";

export default function Footer() {
  // WhatsApp contact URL (same as used in header)
  const whatsappUrl = "https://wa.me/628111086180?text=Halo%20saya%20tertarik%20dengan%20produk%20Hokiindo%20Raya";

  // Carousel states
  const [projectIndex, setProjectIndex] = useState(0);
  const [blogIndex, setBlogIndex] = useState(0);
  const projectScrollRef = useRef<HTMLDivElement>(null);
  const blogScrollRef = useRef<HTMLDivElement>(null);

  // Sample project data
  const projects = [
    {
      id: 1,
      title: "Implementasi Low Voltage Switchgear Siemens SIVACON S8",
      client: "PT Industri Manufaktur Indonesia",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=250&fit=crop&crop=center",
      category: "Low Voltage Systems",
      year: "2024"
    },
    {
      id: 2,
      title: "Sistem Lighting Control G-Comin untuk Smart Building",
      client: "PT Gedung Perkantoran Modern",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop&crop=center",
      category: "Smart Lighting",
      year: "2024"
    },
    {
      id: 3,
      title: "Motor Control Center (MCC) Siemens untuk Pabrik Kimia",
      client: "PT Kimia Nusantara",
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=250&fit=crop&crop=center",
      category: "Motor Control",
      year: "2024"
    },
    {
      id: 4,
      title: "Upgrade Panel Distribusi Low Voltage Siemens 8PT",
      client: "PT Tekstil Prima",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop&crop=center",
      category: "Power Distribution",
      year: "2023"
    },
    {
      id: 5,
      title: "Sistem Emergency Lighting G-Comin Hospital Grade",
      client: "RS Siloam Jakarta",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop&crop=center",
      category: "Emergency Systems",
      year: "2023"
    },
    {
      id: 6,
      title: "Instalasi Circuit Breaker Siemens 3VA untuk Data Center",
      client: "PT Data Center Indonesia",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop&crop=center",
      category: "Data Center Solutions",
      year: "2023"
    }
  ];

  // Sample blog data
  const blogs = [
    {
      id: 1,
      title: "Panduan Lengkap Low Voltage Switchgear Siemens SIVACON S8",
      excerpt: "SIVACON S8 adalah solusi switchgear low voltage terdepan dari Siemens yang menawarkan fleksibilitas tinggi, keamanan maksimal, dan efisiensi energi untuk berbagai aplikasi industri dan komersial...",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=200&fit=crop&crop=center",
      date: "15 Jan 2025",
      category: "Low Voltage",
      readTime: "8 min"
    },
    {
      id: 2,
      title: "Teknologi Smart Lighting G-Comin: Revolusi Pencahayaan Modern",
      excerpt: "G-Comin menghadirkan solusi pencahayaan pintar yang mengintegrasikan teknologi IoT, sensor otomatis, dan kontrol wireless untuk menciptakan sistem lighting yang efisien dan responsif...",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop&crop=center",
      date: "12 Jan 2025",
      category: "Smart Lighting",
      readTime: "6 min"
    },
    {
      id: 3,
      title: "Circuit Breaker Siemens 3VA: Proteksi Optimal untuk Industri",
      excerpt: "Siemens 3VA series menawarkan circuit breaker dengan teknologi terdepan, dilengkapi dengan electronic trip unit, komunikasi digital, dan kemampuan monitoring real-time untuk proteksi sistem kelistrikan...",
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=200&fit=crop&crop=center",
      date: "10 Jan 2025",
      category: "Protection Systems",
      readTime: "7 min"
    },
    {
      id: 4,
      title: "Sistem Emergency Lighting G-Comin untuk Keselamatan Bangunan",
      excerpt: "Sistem emergency lighting G-Comin dirancang khusus untuk memenuhi standar keselamatan internasional, dengan battery backup yang handal dan sistem monitoring terpusat...",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop&crop=center",
      date: "8 Jan 2025",
      category: "Safety Systems",
      readTime: "5 min"
    },
    {
      id: 5,
      title: "Motor Control Center Siemens: Solusi Terpadu untuk Industri",
      excerpt: "MCC Siemens menyediakan kontrol motor yang terintegrasi dengan teknologi digital, monitoring kondisi real-time, dan maintenance predictive untuk optimalisasi operasional industri...",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop&crop=center",
      date: "5 Jan 2025",
      category: "Motor Control",
      readTime: "9 min"
    },
    {
      id: 6,
      title: "Efisiensi Energi dengan Panel Distribusi Low Voltage Siemens",
      excerpt: "Panel distribusi low voltage Siemens 8PT series menghadirkan efisiensi energi tinggi dengan teknologi arc fault detection, energy monitoring, dan smart grid integration...",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop&crop=center",
      date: "3 Jan 2025",
      category: "Energy Efficiency",
      readTime: "6 min"
    }
  ];

  // Carousel navigation functions
  const scrollProjects = (direction: 'left' | 'right') => {
    if (projectScrollRef.current) {
      const scrollAmount = 320; // Width of one card + gap
      const newScrollLeft = direction === 'left' 
        ? projectScrollRef.current.scrollLeft - scrollAmount
        : projectScrollRef.current.scrollLeft + scrollAmount;
      
      projectScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const scrollBlogs = (direction: 'left' | 'right') => {
    if (blogScrollRef.current) {
      const scrollAmount = 320; // Width of one card + gap
      const newScrollLeft = direction === 'left' 
        ? blogScrollRef.current.scrollLeft - scrollAmount
        : blogScrollRef.current.scrollLeft + scrollAmount;
      
      blogScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    const projectInterval = setInterval(() => {
      if (projectScrollRef.current) {
        const maxScroll = projectScrollRef.current.scrollWidth - projectScrollRef.current.clientWidth;
        if (projectScrollRef.current.scrollLeft >= maxScroll) {
          projectScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollProjects('right');
        }
      }
    }, 5000);

    const blogInterval = setInterval(() => {
      if (blogScrollRef.current) {
        const maxScroll = blogScrollRef.current.scrollWidth - blogScrollRef.current.clientWidth;
        if (blogScrollRef.current.scrollLeft >= maxScroll) {
          blogScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollBlogs('right');
        }
      }
    }, 6000);

    return () => {
      clearInterval(projectInterval);
      clearInterval(blogInterval);
    };
  }, []);

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Project Reference Section */}
        <div className="py-12 lg:py-16 border-b border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Project Reference</h2>
              <p className="text-gray-600">Proyek-proyek terbaru yang telah kami kerjakan dengan teknologi Siemens</p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => scrollProjects('left')}
                className="w-10 h-10 bg-gray-100 hover:bg-red-600 text-gray-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollProjects('right')}
                className="w-10 h-10 bg-gray-100 hover:bg-red-600 text-gray-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div 
            ref={projectScrollRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/400x250/f3f4f6/9ca3af?text=Project+Image";
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {project.year}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{project.client}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{project.category}</p>
                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center text-red-600 hover:text-red-700 text-sm font-medium group"
                  >
                    Lihat Detail
                    <ExternalLink className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/projects"
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Lihat Project Lainnya
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Blog Section */}
        <div className="py-12 lg:py-16 border-b border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Blog & Artikel</h2>
              <p className="text-gray-600">Insights terbaru tentang teknologi otomasi dan solusi industri</p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => scrollBlogs('left')}
                className="w-10 h-10 bg-gray-100 hover:bg-red-600 text-gray-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollBlogs('right')}
                className="w-10 h-10 bg-gray-100 hover:bg-red-600 text-gray-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div 
            ref={blogScrollRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/400x200/f3f4f6/9ca3af?text=Blog+Article";
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {blog.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-3 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{blog.date}</span>
                    </div>
                    <span>•</span>
                    <span>{blog.readTime} read</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {blog.excerpt}
                  </p>
                  <Link
                    href={`/blog/${blog.id}`}
                    className="inline-flex items-center text-red-600 hover:text-red-700 text-sm font-medium group"
                  >
                    Baca Selengkapnya
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Lihat Blog Lainnya
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <Image
                  src="/images/asset-web/logo.png"
                  alt="Hokiindo Raya"
                  width={140}
                  height={45}
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-red-600 font-semibold text-sm mb-4">
                Distributor Resmi Siemens Indonesia
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Hokiindo Raya adalah distributor resmi produk Siemens di Indonesia, menyediakan solusi otomasi industri, sistem kontrol, dan peralatan listrik berkualitas tinggi untuk berbagai kebutuhan industri.
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-9 h-9 bg-gray-100 hover:bg-red-600 text-gray-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-gray-100 hover:bg-red-600 text-gray-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-gray-100 hover:bg-red-600 text-gray-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-gray-100 hover:bg-red-600 text-gray-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-gray-900 font-semibold text-base mb-6">Menu Utama</h3>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/" 
                    className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/about" 
                    className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/products" 
                    className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Produk
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/projects" 
                    className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Project & Reference
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blog" 
                    className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Blog
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>

            {/* Product Categories */}
            <div>
              <h3 className="text-gray-900 font-semibold text-base mb-6">Kategori Produk</h3>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/products?category=automation" 
                    className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Sistem Otomasi
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/products?category=control" 
                    className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Sistem Kontrol
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/products?category=electrical" 
                    className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Peralatan Listrik
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/products?category=motor" 
                    className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Motor & Drive
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/products?category=safety" 
                    className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Safety Systems
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/products" 
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    Lihat Semua Produk
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-gray-900 font-semibold text-base mb-6">Hubungi Kami</h3>
              <div className="space-y-4">
                
                {/* Phone */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Telepon</p>
                    <a 
                      href="tel:+628111086180"
                      className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200"
                    >
                      +62 811 1086 180
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Email</p>
                    <a 
                      href="mailto:info@hokiindo.com"
                      className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200"
                    >
                      info@hokiindo.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Alamat</p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Jakarta, Indonesia
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Jam Operasional</p>
                    <p className="text-gray-600 text-sm">Senin - Jumat: 08:00 - 17:00</p>
                    <p className="text-gray-600 text-sm">Sabtu: 08:00 - 12:00</p>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <div className="pt-4">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Chat WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-600 text-sm">
                © 2025 <span className="font-semibold text-gray-900">Hokiindo Raya</span>. All rights reserved.
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6">
              <Link 
                href="/privacy" 
                className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link 
                href="/careers" 
                className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200"
              >
                Karir
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </footer>
  );
} 