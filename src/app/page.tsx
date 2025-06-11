"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  Zap, 
  Shield, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Star,
  Phone,
  X,
  MessageCircle,
  Settings,
  Clock,
  Users,
  ArrowRight,
  MapPin,
  ExternalLink,
  Building2,
  Calendar,
  ShoppingCart,
  Eye,
  AlertCircle
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/context/LangContext";
import { useSiemensProducts, useSupabaseSiemensProducts } from "@/hooks/useProducts";
import { formatRupiah } from "@/utils/formatters";

export default function Home() {
  const { lang } = useLang();
  
  // Get Siemens products from API
  const { products: siemensProducts, loading: productsLoading, error: productsError, refetch } = useSiemensProducts(6);
  
  // Get Featured Siemens products from Supabase
  const { products: featuredProducts, loading: featuredLoading, error: featuredError, refetch: refetchFeatured } = useSupabaseSiemensProducts(10);
  
  // Debug log to see what we're getting
  useEffect(() => {
    console.log('🔍 [HOME] Featured products data:', {
      loading: featuredLoading,
      error: featuredError,
      productsCount: featuredProducts?.length || 0,
      firstFewProducts: featuredProducts?.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name?.substring(0, 30) + '...',
        price: p.price,
        accurate_code: p.accurate_code,
        status: p.status
      }))
    });
    
    if (!featuredLoading && featuredProducts?.length === 1) {
      console.warn('⚠️ [HOME] Only 1 product loaded - this might indicate filtering issues');
    }
  }, [featuredProducts, featuredLoading, featuredError]);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
  const [isPromoPlaying, setIsPromoPlaying] = useState(true);
  const [isPromoTransitioning, setIsPromoTransitioning] = useState(false);
  const [currentFeaturedSlide, setCurrentFeaturedSlide] = useState(0);
  const [isFeaturedTransitioning, setIsFeaturedTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState({
    features: false,
    logos: false,
    whyChoose: false,
    projects: false,
    promos: false,
    featured: false
  });
  
  const featuresRef = useRef<HTMLDivElement>(null);
  const logosRef = useRef<HTMLDivElement>(null);
  const whyChooseRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const promosRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Combine language data with images
  const slides = lang.hero.slides.map((slide: { title: string; description: string }, index: number) => ({
    id: index + 1,
    title: slide.title,
    description: slide.description,
    image: index === 0 ? `/images/asset-web/banner-pakbob.png` : `/images/asset-web/baner-${index + 1}.png`
  }));

  // Get project references from language context
  const projectReferences = lang.projects.projectList;

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSlideDirection('next');
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSlideDirection('prev');
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setSlideDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      alert(`Terima kasih! Kami akan menghubungi Anda di ${phoneNumber} dalam 15 menit.`);
      setPhoneNumber("");
      setShowConsultationForm(false);
    }
  };

  const toggleConsultationForm = () => {
    setShowConsultationForm(!showConsultationForm);
  };

  const closeConsultationForm = () => {
    setShowConsultationForm(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeConsultationForm();
    }
  };

  // Carousel navigation functions for multi-item display
  const nextPromoSlide = () => {
    if (isPromoTransitioning || !siemensProducts || siemensProducts.length === 0) return;
    setIsPromoTransitioning(true);
    setCurrentPromoSlide((prev) => (prev + 1) % siemensProducts.length);
    setTimeout(() => setIsPromoTransitioning(false), 600);
  };

  const prevPromoSlide = () => {
    if (isPromoTransitioning || !siemensProducts || siemensProducts.length === 0) return;
    setIsPromoTransitioning(true);
    setCurrentPromoSlide((prev) => (prev - 1 + siemensProducts.length) % siemensProducts.length);
    setTimeout(() => setIsPromoTransitioning(false), 600);
  };

  const goToPromoSlide = (index: number) => {
    if (isPromoTransitioning || index === currentPromoSlide) return;
    setIsPromoTransitioning(true);
    setCurrentPromoSlide(index);
    setTimeout(() => setIsPromoTransitioning(false), 600);
  };

  const handlePromoHover = () => {
    setIsPromoPlaying(false);
  };

  const handlePromoLeave = () => {
    setIsPromoPlaying(true);
  };

  // Featured products carousel navigation functions
  const nextFeaturedSlide = () => {
    if (isFeaturedTransitioning || !featuredProducts || featuredProducts.length === 0) return;
    setIsFeaturedTransitioning(true);
    
    if (window.innerWidth >= 768) {
      // Desktop: move by 1, but don't exceed the limit where we can't show 4 items
      const maxSlide = Math.max(0, featuredProducts.length - 4);
      setCurrentFeaturedSlide((prev) => Math.min(prev + 1, maxSlide));
    } else {
      // Mobile: move by 2
      setCurrentFeaturedSlide((prev) => (prev + 2) % featuredProducts.length);
    }
    setTimeout(() => setIsFeaturedTransitioning(false), 600);
  };

  const prevFeaturedSlide = () => {
    if (isFeaturedTransitioning || !featuredProducts || featuredProducts.length === 0) return;
    setIsFeaturedTransitioning(true);
    
    if (window.innerWidth >= 768) {
      // Desktop: move by 1, minimum is 0
      setCurrentFeaturedSlide((prev) => Math.max(prev - 1, 0));
    } else {
      // Mobile: move by 2
      setCurrentFeaturedSlide((prev) => (prev - 2 + featuredProducts.length) % featuredProducts.length);
    }
    setTimeout(() => setIsFeaturedTransitioning(false), 600);
  };

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            if (target === featuresRef.current) {
              setIsVisible(prev => ({ ...prev, features: true }));
            } else if (target === logosRef.current) {
              setIsVisible(prev => ({ ...prev, logos: true }));
            } else if (target === whyChooseRef.current) {
              setIsVisible(prev => ({ ...prev, whyChoose: true }));
            } else if (target === projectsRef.current) {
              setIsVisible(prev => ({ ...prev, projects: true }));
            } else if (target === promosRef.current) {
              setIsVisible(prev => ({ ...prev, promos: true }));
            } else if (target === featuredRef.current) {
              setIsVisible(prev => ({ ...prev, featured: true }));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) observer.observe(featuresRef.current);
    if (logosRef.current) observer.observe(logosRef.current);
    if (whyChooseRef.current) observer.observe(whyChooseRef.current);
    if (projectsRef.current) observer.observe(projectsRef.current);
    if (promosRef.current) observer.observe(promosRef.current);
    if (featuredRef.current) observer.observe(featuredRef.current);

    return () => observer.disconnect();
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    const getSlideInterval = (slideIndex: number) => {
      return slideIndex === slides.length - 1 ? 4000 : 3000;
    };

    const timer = setTimeout(() => {
      if (!isTransitioning && !showConsultationForm) {
        nextSlide();
      }
    }, getSlideInterval(currentSlide));

    return () => clearTimeout(timer);
  }, [currentSlide, isTransitioning, showConsultationForm, slides.length]);

  // Auto-advance promo slideshow
  useEffect(() => {
    if (!isPromoPlaying) return;

    const timer = setTimeout(() => {
      nextPromoSlide();
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [currentPromoSlide, isPromoPlaying]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showConsultationForm) {
        closeConsultationForm();
      }
      if (!showConsultationForm && !isTransitioning) {
        if (e.key === 'ArrowLeft') {
          prevSlide();
        } else if (e.key === 'ArrowRight') {
          nextSlide();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showConsultationForm, isTransitioning]);

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        /* Continuous Logo Marquee Animation */
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        
        .animate-marquee:hover {
          animation-play-state: paused;
        }

        /* Floating Badge Animation */
        @keyframes floatBadge {
          0%, 100% {
            transform: translateY(0) rotate(-3deg);
          }
          50% {
            transform: translateY(-8px) rotate(-3deg);
          }
        }
        
        .animate-float-badge {
          animation: floatBadge 3s ease-in-out infinite;
        }

        /* Card Hover Effects */
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        /* Project Card Unique Styling */
        .project-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
        }
        
        .project-card:hover {
          transform: translateY(-12px) scale(1.03);
          box-shadow: 0 30px 60px rgba(220, 38, 38, 0.2);
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }
        
        .project-card:hover .project-image {
          transform: scale(1.1);
        }
        
        .project-image {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Staggered Grid Animation */
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }
        
        /* Background Pattern */
        .projects-bg {
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(220, 38, 38, 0.03) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.03) 2px, transparent 2px);
          background-size: 50px 50px;
        }

        @keyframes slideProgress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @keyframes float-pulse {
          0%, 100% {
            transform: translateY(0) scale(1);
            box-shadow: 0 10px 40px rgba(220, 38, 38, 0.3);
          }
          50% {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 15px 50px rgba(220, 38, 38, 0.4);
          }
        }
        
        .animate-float-pulse {
          animation: float-pulse 3s ease-in-out infinite;
        }

        /* Seamless Product Carousel Styling */
        .seamless-carousel-container {
          position: relative;
          overflow: hidden;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          padding: 0;
        }
        
        .seamless-carousel-track {
          display: flex;
          transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          gap: 32px;
          padding: 0 calc(50vw - 50%);
          will-change: transform;
        }
        
        .seamless-carousel-item {
          flex-shrink: 0;
          width: calc(20% - 25.6px); /* 5 items on desktop */
        }
        
        .seamless-product-card {
          width: 100%;
          height: 100%;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: grab;
        }
        
        .seamless-product-card:active {
          cursor: grabbing;
        }
        
        .seamless-product-card:hover {
          transform: translateY(-12px) scale(1.04);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.12);
        }
        
        .seamless-product-image {
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .seamless-product-card:hover .seamless-product-image {
          transform: scale(1.08);
        }
        
        /* Smooth drag behavior */
        .seamless-carousel-track.dragging {
          transition: none;
        }
        
        /* Hide scrollbar but keep functionality */
        .seamless-carousel-container::-webkit-scrollbar {
          display: none;
        }
        
        .seamless-carousel-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Responsive breakpoints for seamless design */
        @media (max-width: 1024px) {
          .seamless-carousel-item {
            width: calc(33.333% - 21.33px); /* 3 items on tablet */
          }
          
          .seamless-carousel-track {
            gap: 24px;
          }
        }
        
        @media (max-width: 768px) {
          .seamless-carousel-item {
            width: calc(50% - 12px); /* 2 items on mobile */
          }
          
          .seamless-carousel-track {
            gap: 20px;
          }
        }
        
        @media (max-width: 640px) {
          .seamless-carousel-item {
            width: calc(100% - 0px); /* 1 item on small mobile */
          }
          
          .seamless-carousel-track {
            gap: 16px;
          }
        }
        
        /* Floating discount badge */
        .floating-discount-badge {
          backdrop-filter: blur(8px);
          animation: float 2s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
      `}</style>
      
      <Header />
      
      {/* Hero Slideshow */}
      <section className="w-full py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="relative h-[500px] md:h-[600px] lg:h-[700px]">
              
              <div className="relative w-full h-full overflow-hidden">
                {slides.map((slide, index) => {
                  const isActive = index === currentSlide;
                  const isPrev = index === (currentSlide - 1 + slides.length) % slides.length;
                  const isNext = index === (currentSlide + 1) % slides.length;
                  
                  let slideClass = 'absolute inset-0 transition-all duration-[800ms] ease-in-out';
                  
                  if (isActive) {
                    slideClass += ' opacity-100 translate-x-0 z-20';
                  } else if (isNext && slideDirection === 'next') {
                    slideClass += ' opacity-0 translate-x-full z-10';
                  } else if (isPrev && slideDirection === 'prev') {
                    slideClass += ' opacity-0 -translate-x-full z-10';
                  } else if (slideDirection === 'next') {
                    slideClass += ' opacity-0 -translate-x-full z-0';
                  } else {
                    slideClass += ' opacity-0 translate-x-full z-0';
                  }

                  return (
                    <div key={slide.id} className={slideClass}>
                      {index === 0 ? (
                        // Special handling for first slide (award image) - centered and not cropped
                        <div className="absolute inset-0 transition-transform duration-[800ms] ease-in-out">
                          <img 
                            src={slide.image}
                            alt="Siemens Award Certificate"
                            className="w-full h-full object-cover object-center transition-transform duration-[800ms] ease-in-out"
                            style={{ 
                              transform: isActive ? 'scale(1)' : 'scale(1.05)',
                              objectPosition: 'center 30%'
                            }}
                          />
                        </div>
                      ) : (
                        // Regular background image for other slides
                        <div 
                          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[800ms] ease-in-out"
                          style={{ 
                            backgroundImage: `url(${slide.image})`,
                            transform: isActive ? 'scale(1)' : 'scale(1.05)'
                          }}
                        />
                      )}
                      
                      {/* Overlay only for bottom half - full width */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/70 to-transparent" />
                      
                      <div className="relative z-10 flex items-end h-full p-4 sm:p-6 md:p-8">
                        <div className="w-full max-w-4xl mx-auto pb-8 sm:pb-12 md:pb-16">
                          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight transition-all duration-1000 ${
                              isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                            }`} style={{ transitionDelay: isActive ? '400ms' : '0ms' }}>
                              {slide.title}
                            </h1>
                            
                            <p className={`text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-3xl transition-all duration-1000 ${
                              isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                            }`} style={{ transitionDelay: isActive ? '600ms' : '0ms' }}>
                              {slide.description}
                            </p>
                          </div>
                          
                          <div className={`flex flex-row md:flex-row justify-start gap-2 md:gap-4 mb-8 md:mb-0 transition-all duration-1000 ${
                            isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                          }`} style={{ transitionDelay: isActive ? '800ms' : '0ms' }}>
                            <Link 
                              href="/products"
                              className="flex-1 md:flex-none inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 rounded-lg font-semibold text-xs md:text-base transition-all duration-300 shadow-2xl hover:shadow-red-500/25 transform hover:-translate-y-1 hover:scale-105"
                            >
                              <Shield className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2" />
                              <span>{lang.hero.exploreButton}</span>
                            </Link>
                            
                            <Link 
                              href="#contact"
                              className="flex-1 md:flex-none inline-flex items-center justify-center bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-gray-900 px-3 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 rounded-lg font-semibold text-xs md:text-base transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                            >
                              <Award className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2" />
                              <span>{lang.hero.consultationButton}</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={prevSlide}
                disabled={isTransitioning}
                className="absolute left-2 sm:left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-1 sm:p-2 md:p-4 rounded-full transition-all duration-300 z-30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
              
              <button
                onClick={nextSlide}
                disabled={isTransitioning}
                className="absolute right-2 sm:right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-1 sm:p-2 md:p-4 rounded-full transition-all duration-300 z-30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
              
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    disabled={isTransitioning}
                    className={`relative transition-all duration-500 disabled:cursor-not-allowed ${
                      index === currentSlide
                        ? 'w-8 h-3 bg-white rounded-full shadow-lg scale-110' 
                        : 'w-3 h-3 bg-white/50 hover:bg-white/80 rounded-full hover:scale-110'
                    }`}
                    aria-label={`Go to slide ${index + 1}${index === slides.length - 1 ? ' (longer pause)' : ''}`}
                  >
                    {index === currentSlide && (
                      <div 
                        className="absolute inset-0 bg-red-500 rounded-full origin-left"
                        style={{
                          animation: `slideProgress ${index === slides.length - 1 ? '4000' : '3000'}ms linear`
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Company Partners Section */}
      <section 
        ref={logosRef}
        className="w-full py-16 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className={`text-center mb-12 transition-all duration-1000 ${
            isVisible.logos ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {lang.trusted.title}
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>
          
          {/* Logo Marquee */}
          <div className="relative overflow-hidden pb-5">
            <div className="flex animate-marquee space-x-8 md:space-x-12 lg:space-x-16">
              {/* First Set */}
              <div className="flex space-x-8 md:space-x-12 lg:space-x-16 flex-shrink-0">
                {lang.trusted.companyLogos.map((company: { name: string; image: string; alt: string }, index: number) => (
                  <div key={index} className="w-32 h-20 md:w-40 md:h-24 lg:w-48 lg:h-28 flex items-center justify-center bg-white rounded-lg shadow-sm p-4">
                    <img 
                      src={company.image}
                      alt={company.alt}
                      className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
              
              {/* Duplicate Set for Seamless Loop */}
              <div className="flex space-x-8 md:space-x-12 lg:space-x-16 flex-shrink-0">
                {lang.trusted.companyLogos.map((company: { name: string; image: string; alt: string }, index: number) => (
                  <div key={`duplicate-${index}`} className="w-32 h-20 md:w-40 md:h-24 lg:w-48 lg:h-28 flex items-center justify-center bg-white rounded-lg shadow-sm p-4">
                    <img 
                      src={company.image}
                      alt={company.alt}
                      className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className={`flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mt-12 transition-all duration-1000 delay-300 ${
            isVisible.logos ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex items-center space-x-2 text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">{lang.trusted.companies}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">{lang.trusted.rating}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-sm">{lang.trusted.warranty}</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Hokiindo Section */}
      <section className="w-full py-20 bg-gradient-to-br from-red-600 to-red-700 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="text-white space-y-6">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  {lang.aboutHokiindo.title}
                </h2>
                <p className="text-xl md:text-2xl text-red-100 font-light mb-6">
                  {lang.aboutHokiindo.subtitle}
                </p>
                <div className="w-24 h-1 bg-white/50 mb-8"></div>
              </div>

              <p className="text-lg leading-relaxed text-red-50 mb-8">
                {lang.aboutHokiindo.description}
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {lang.aboutHokiindo.features.map((feature: { title: string; description: string; icon: string }, index: number) => (
                  <div key={index} className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                      <p className="text-red-100 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div>
                <Link 
                  href="/about"
                  className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-red-600 font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-lg"
                >
                  <span>{lang.aboutHokiindo.detailButton}</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/images/asset-web/about-4.png"
                  alt="Hokiindo Raya Office"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/600x700/f3f4f6/9ca3af?text=Hokiindo+Office";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              </div>
              
              {/* Floating Stats Card */}
              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 text-center border border-gray-100">
                <div className="text-2xl font-bold text-red-600 mb-1">100+</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Hokiindo Section */}
      <section 
        ref={whyChooseRef}
        className="w-full py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          

          {/* Section Title */}
          <div className={`text-center mb-16 transition-all duration-1000 ${
            isVisible.whyChoose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {lang.whyChoose.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {lang.whyChoose.subtitle}
            </p>
            <div className="w-24 h-1 bg-red-600 mx-auto mt-6"></div>
          </div>
          
          {/* 4-Card Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {lang.whyChoose.reasons.map((reason: { title: string; description: string; image: string }, index: number) => {
              const iconColors = [
                "from-blue-500 to-blue-600",
                "from-green-500 to-green-600", 
                "from-purple-500 to-purple-600",
                "from-orange-500 to-orange-600"
              ];
              
              const icons = [
                <Settings key="settings" className="w-6 h-6 text-white" />,
                <Clock key="clock" className="w-6 h-6 text-white" />,
                <Users key="users" className="w-6 h-6 text-white" />,
                <Shield key="shield" className="w-6 h-6 text-white" />
              ];

              return (
                <div 
                  key={index}
                  className={`card-hover bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-1000 delay-${(index + 1) * 100} ${
                    isVisible.whyChoose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <div className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${iconColors[index]} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                      {icons[index]}
                    </div>
                    <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={reason.image}
                        alt={reason.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600 text-sm text-center leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className={`text-center transition-all duration-1000 delay-500 ${
            isVisible.whyChoose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <Link 
              href="/products"
              className="inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-lg"
            >
              <span>{lang.whyChoose.ctaButton}</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Project Reference Section - HIDDEN */}
      <section 
        ref={projectsRef}
        className="hidden w-full py-20 projects-bg bg-gray-100 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Title */}
          <div className={`text-center mb-16 transition-all duration-1000 ${
            isVisible.projects ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {lang.projects.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-2">
              {lang.projects.subtitle}
            </p>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </div>
          
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectReferences.map((project, index) => (
              <div
                key={project.id}
                className={`project-card bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 group transition-all duration-1000 stagger-${index + 1} ${
                  isVisible.projects ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                {/* Project Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src="https://placehold.co/600x400/f3f4f6/9ca3af?text=Project+Image"
                    alt={project.title}
                    className="project-image w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {project.category}
                    </span>
                  </div>
                  
                  {/* Year Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded-md flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{project.year}</span>
                    </div>
                  </div>
                </div>
                
                {/* Project Content */}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {project.description}
                  </p>
                  
                  {/* Project Meta */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <Building2 className="w-4 h-4 mr-2" />
                      <span>{project.client}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{project.location}</span>
                    </div>
                  </div>
                  
                  {/* View Details Button */}
                  <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center space-x-2 group-hover:scale-105">
                    <span>{lang.projects.viewDetails}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* View All Projects CTA */}
          <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${
            isVisible.projects ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <Link 
              href="/projects"
              className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-gray-900 font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-200 hover:border-red-600 text-lg"
            >
              <span>{lang.projects.viewAll}</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>


      {/* Featured Products Section - Produk Pilihan untuk Anda */}
      <section 
        ref={featuredRef}
        className="w-full pt-20 pb-5 bg-gradient-to-br from-red-50 via-white to-rose-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5">
          
          {/* Section Header */}
          <div className={`flex pb-5 flex-col sm:flex-row sm:items-center sm:justify-between mb-12 transition-all duration-1000 ${
            isVisible.featured ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="mb-6 sm:mb-0">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {lang.siemensProducts.title}
              </h2>
              <p className="text-lg text-gray-600 font-light">
                {lang.siemensProducts.subtitle}
              </p>
              {!featuredLoading && featuredProducts.length > 0 && (
                <p className="text-sm text-red-600 font-medium mt-4">
                  {featuredProducts.length} {lang.siemensProducts.availableProducts}
                </p>
              )}
            </div>
            
            {/* Navigation Arrows */}
            {!featuredLoading && !featuredError && featuredProducts.length > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevFeaturedSlide}
                  disabled={isFeaturedTransitioning}
                  className="w-12 h-12 bg-white hover:bg-red-50 border border-red-200 hover:border-red-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                  aria-label="Previous featured products"
                >
                  <ChevronLeft className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors duration-300" />
                </button>
                <button
                  onClick={nextFeaturedSlide}
                  disabled={isFeaturedTransitioning}
                  className="w-12 h-12 bg-white hover:bg-red-50 border border-red-200 hover:border-red-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                  aria-label="Next featured products"
                >
                  <ChevronRight className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors duration-300" />
                </button>
              </div>
            )}
          </div>
          
          {/* Loading State */}
          {featuredLoading && (
            <div className={`text-center py-16 transition-all duration-1000 delay-300 ${
              isVisible.featured ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">{lang.siemensProducts.loading}</p>
              <p className="text-sm text-gray-500 mt-2">{lang.siemensProducts.loadingWait}</p>
            </div>
          )}
          
          {/* Error State */}
          {featuredError && (
            <div className={`text-center py-16 transition-all duration-1000 delay-300 ${
              isVisible.featured ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">{lang.siemensProducts.errorTitle}</h3>
                <div className="text-red-600 mb-4 text-sm text-left bg-red-100 p-3 rounded">
                  <pre className="whitespace-pre-wrap">{featuredError}</pre>
                </div>
                <button
                  onClick={refetchFeatured}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  {lang.siemensProducts.retryButton}
                </button>
              </div>
            </div>
          )}
          
          {/* No Products Found State */}
          {!featuredLoading && !featuredError && featuredProducts.length === 0 && (
            <div className={`text-center py-16 transition-all duration-1000 delay-300 ${
              isVisible.featured ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">{lang.siemensProducts.noProductsTitle}</h3>
                <p className="text-red-600 mb-4 text-sm">
                  {lang.siemensProducts.noProductsMessage}
                </p>
                <button
                  onClick={refetchFeatured}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  {lang.siemensProducts.refreshButton}
                </button>
              </div>
            </div>
          )}
          
          {/* Products Carousel */}
          {!featuredLoading && !featuredError && featuredProducts.length > 0 && (
            <div className={`transition-all duration-1000 delay-300 ${
              isVisible.featured ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              
              {/* Desktop Carousel - Show 4 products, slide by 1 */}
              <div className="hidden md:block relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-600 ease-in-out"
                  style={{ 
                    transform: `translateX(-${currentFeaturedSlide * (100 / 4)}%)`,
                  }}
                >
                  {featuredProducts.map((product, index) => (
                                      <div 
                    key={product.id} 
                    className="w-1/4 flex-shrink-0 px-3 pb-5"
                  >
                      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-full flex flex-col">
                        
                        {/* Product Image */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img 
                            src={product.admin_thumbnail || "https://placehold.co/600x400/f8fafc/64748b?text=Product+Image"}
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          
                          {/* Stock Status Badge */}
                          {product.stock_quantity > 0 ? (
                            <div className="absolute top-3 left-3">
                              <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                {lang.siemensProducts.stockAvailable}
                              </span>
                            </div>
                          ) : (
                            <div className="absolute top-3 left-3">
                              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                {lang.siemensProducts.stockIndent}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Content */}
                        <div className="p-5 flex-1 flex flex-col">
                          
                          {/* Product Name */}
                          <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 leading-tight transition-colors duration-300 group-hover:text-red-600">
                            {product.name && product.name.trim() && product.name.toLowerCase() !== 'null' 
                              ? product.name 
                              : 'Produk Berkualitas'}
                          </h3>
                          
                          {/* Product Code */}
                          {product.accurate_code && (
                            <div className="mb-3">
                              <p className="text-sm font-mono font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded">
                                {lang.siemensProducts.productCode}: {product.accurate_code}
                              </p>
                            </div>
                          )}
                          
                          {/* Category */}
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">
                              {lang.siemensProducts.category}: <span className="text-gray-900">{product.category || lang.siemensProducts.categoryNotAvailable}</span>
                            </p>
                          </div>
                          
                          {/* Price */}
                          <div className="mb-4">
                            <span className="text-2xl font-bold text-red-600">
                              {product.price > 0 ? formatRupiah(product.price) : lang.siemensProducts.priceContactSales}
                            </span>
                          </div>
                          
                          {/* Action Button */}
                          <div className="mt-auto">
                            {product.stock_quantity > 0 ? (
                              <button 
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                <span>{lang.siemensProducts.addToCart}</span>
                              </button>
                            ) : (
                              <a 
                                href={`https://wa.me/628111086180?text=${encodeURIComponent(lang.siemensProducts.whatsappStockMessage)}:%20${encodeURIComponent(product.name || 'Produk')}${product.accurate_code ? `%20(${lang.siemensProducts.productCode}:%20${encodeURIComponent(product.accurate_code)})` : ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>{lang.siemensProducts.contactForStock}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mobile Carousel - Show 2 products, slide by 2 */}
              <div className="md:hidden relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-600 ease-in-out"
                  style={{ 
                    transform: `translateX(-${currentFeaturedSlide * 50}%)`,
                  }}
                >
                  {featuredProducts.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="w-1/2 flex-shrink-0 px-2 pb-5"
                    >
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                        
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden">
                          <img 
                            src={product.admin_thumbnail || "https://placehold.co/400x400/f8fafc/64748b?text=Product"}
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          
                          {/* Stock Status Badge */}
                          {product.stock_quantity > 0 ? (
                            <div className="absolute top-2 left-2">
                              <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                {lang.siemensProducts.stockAvailable}
                              </span>
                            </div>
                          ) : (
                            <div className="absolute top-2 left-2">
                              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                {lang.siemensProducts.stockIndent}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          
                          {/* Product Name */}
                          <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 leading-tight transition-colors duration-300 group-hover:text-red-600">
                            {product.name && product.name.trim() && product.name.toLowerCase() !== 'null' 
                              ? product.name 
                              : 'Produk Berkualitas'}
                          </h3>
                          
                          {/* Product Code */}
                          {product.accurate_code && (
                            <div className="mb-2">
                              <p className="text-xs font-mono font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {product.accurate_code}
                              </p>
                            </div>
                          )}
                          
                          {/* Category */}
                          <div className="mb-3">
                            <p className="text-xs text-gray-600">
                              {product.category || lang.siemensProducts.categoryNotAvailable}
                            </p>
                          </div>
                          
                          {/* Price */}
                          <div className="mb-3">
                            <span className="text-lg font-bold text-red-600">
                              {product.price > 0 ? formatRupiah(product.price) : lang.siemensProducts.priceContactSales}
                            </span>
                          </div>
                          
                          {/* Action Button */}
                          <div className="mt-auto">
                            {product.stock_quantity > 0 ? (
                              <button 
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 text-sm"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span>{lang.siemensProducts.addToCart}</span>
                              </button>
                            ) : (
                              <a 
                                href={`https://wa.me/628111086180?text=${encodeURIComponent(lang.siemensProducts.whatsappStockMessage)}:%20${encodeURIComponent(product.name || 'Produk')}${product.accurate_code ? `%20(${lang.siemensProducts.productCode}:%20${encodeURIComponent(product.accurate_code)})` : ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 text-sm"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>{lang.siemensProducts.contactForStock}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* View All Products CTA */}
          {!featuredLoading && featuredProducts.length > 0 && (
            <div className={`text-center mt-12 mb-16 transition-all duration-1000 delay-500 ${
              isVisible.featured ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <Link 
                href="/search?query=siemens"
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-lg"
              >
                <span>{lang.siemensProducts.viewAll}</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Floating Consultation Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Consultation Button */}
        <button
          onClick={toggleConsultationForm}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-red-500/50 animate-float-pulse"
          aria-label="Get Free Konsultasi"
        >
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Get Free Konsultasi</span>
            <span className="sm:hidden">Konsultasi</span>
          </div>
        </button>
      </div>

      {/* Consultation Form Modal */}
      {showConsultationForm && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:justify-end"
          onClick={handleBackdropClick}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" />
          
          <div className={`relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl transform transition-all duration-500 ease-out w-full sm:w-96 sm:mr-6 sm:mb-6 ${
            showConsultationForm 
              ? 'translate-y-0 sm:translate-y-0 opacity-100' 
              : 'translate-y-full sm:translate-x-full opacity-0'
          }`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Konsultasi Gratis</h3>
                  <p className="text-sm text-gray-600">Hubungi expert kami</p>
                </div>
              </div>
              
              <button
                onClick={closeConsultationForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Close consultation form"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleConsultationSubmit} className="p-6 space-y-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Masukkan nomor HP Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-base"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center space-x-2 focus:outline-none focus:ring-4 focus:ring-red-500/50"
              >
                <Phone className="w-5 h-5" />
                <span>Hubungi Saya</span>
              </button>
              
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Kami akan segera menghubungi Anda untuk konsultasi gratis dalam waktu 15 menit
              </p>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
