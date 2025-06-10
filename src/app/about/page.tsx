"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import { 
  Award, 
  Users, 
  Globe, 
  Zap, 
  CheckCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  TrendingUp,
  Rocket,
  Handshake,
  Trophy,
  Sparkles
} from "lucide-react";

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (aboutRef.current) observer.observe(aboutRef.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { icon: Users, value: "500+", label: "Happy Clients" },
    { icon: Award, value: "12+", label: "Years Experience" },
    { icon: Globe, value: "50+", label: "Cities Served" },
    { icon: Zap, value: "1000+", label: "Projects Completed" }
  ];

  const timeline = [
    {
      year: "2013",
      title: "Company Founded",
      description: "PT. Hokiindo Raya was established as a trusted provider of electrical infrastructure solutions for various industrial sectors.",
      icon: Building
    },
    {
      year: "2015",
      title: "Business Expansion",
      description: "Expanded operations nationwide serving industrial, commercial, and utility-scale applications with comprehensive electrical solutions.",
      icon: TrendingUp
    },
    {
      year: "2018",
      title: "Digital Innovation",
      description: "Launched integrated online and offline purchasing systems for retail to large project procurement with professional customer service.",
      icon: Rocket
    },
    {
      year: "2023",
      title: "Siemens Official Partnership",
      description: "Appointed as official partner of Siemens Smart Infrastructure Electrical Products (SI EP) since July 1, 2023.",
      icon: Handshake
    },
    {
      year: "2024",
      title: "G-Coming Partnership",
      description: "Became G-Coming official partner, collaborating with Shenzhen Coming Technology for international standard lighting solutions.",
      icon: Trophy
    },
    {
      year: "2024",
      title: "Leading Innovation",
      description: "Continuing to lead in electrical infrastructure with sustainable, efficient, and reliable solutions for Indonesia's development.",
      icon: Sparkles
    }
  ];

  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in every aspect of our business, from product quality to customer service."
    },
    {
      icon: Users,
      title: "Partnership",
      description: "Building strong, long-lasting relationships with our clients and partners is at the heart of what we do."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We embrace cutting-edge technology and innovative solutions to meet evolving industrial needs."
    },
    {
      icon: CheckCircle,
      title: "Reliability",
      description: "Our clients trust us to deliver consistent, reliable solutions that power their operations."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/asset-web/about-1.png"
            alt="PT. Hokiindo Raya - Electrical Infrastructure Solutions"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-red-900/80"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Subtitle */}
            <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full px-6 py-3 mb-8">
              <Award className="w-5 h-5 text-red-400" />
              <span className="text-red-300 font-semibold">Since 2013 • Trusted Partner</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="block">About</span>
              <span className="block bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                Hokiindo Raya
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-12 leading-relaxed">
              Leading provider of <span className="text-red-400 font-semibold">electrical infrastructure solutions</span> 
              and <span className="text-red-400 font-semibold">industrial automation</span> serving Indonesia 
              with international quality standards
            </p>
            
            {/* Partnership Badges */}
            <div className="flex flex-wrap justify-center gap-6 mb-16">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4">
                <div className="text-sm text-gray-300 mb-1">Official Partner Since 2023</div>
                <div className="text-lg font-bold text-white">Siemens SI EP</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4">
                <div className="text-sm text-gray-300 mb-1">Partner Since 2024</div>
                <div className="text-lg font-bold text-white">G-Coming Technology</div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                    <stat.icon className="w-10 h-10 mx-auto mb-4 text-red-400 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-gray-300 text-sm md:text-base">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Brand Story */}
        <section className="mb-20" ref={aboutRef}>
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                PT. Hokiindo Raya established in 2013 and has been operating for more than 12 years as a trusted provider of electrical infrastructure, serving various industrial sectors with innovative and high-quality solutions.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                As an Authorized Partner of Siemens and Shenzhen Coming Technology, PT. Hokiindo Raya presents international standard, high-performance, and durable electrical products to support critical infrastructure.
              </p>
              <p className="text-lg text-gray-600">
                Supported by certified experts and industry standard-based employees, PT. Hokiindo Raya ensures that every project runs efficiently, safely, and according to customer technical needs.
              </p>
            </div>
            <div className="relative">
              <img
                src="/images/asset-web/about-5.png"
                alt="Our Team"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-red-600 text-white p-6 rounded-xl shadow-lg">
                <div className="text-2xl font-bold">12+</div>
                <div className="text-sm">Years of Excellence</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-20">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12 bg-gradient-to-br from-red-50 to-red-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>1. Provide the best quality products with environmentally friendly and sustainable standards</p>
                  <p>2. Build strong strategic partnerships</p>
                  <p>3. Provide professional distribution services through an integrated management system</p>
                </div>
              </div>
              <div className="p-8 md:p-12 bg-gradient-to-br from-blue-50 to-blue-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-700 leading-relaxed">
                  To become a leading electrical equipment distributor in Indonesia that is trusted and superior in presenting quality products from international brands, to support the development of reliable, efficient, and sustainable electrical infrastructure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide our work and define our commitment to excellence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Milestones that shaped our growth and success over the years
            </p>
          </div>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-red-200"></div>
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-red-600" />
                        <span className="text-lg font-bold text-red-600">{item.year}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="relative z-10 flex items-center justify-center w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-lg">
                  </div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Primary Business */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Primary Business</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three main business divisions providing comprehensive electrical solutions
            </p>
          </div>
          
          <div className="space-y-8">
            {/* Siemens Partnership */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="bg-blue-100 text-blue-600 rounded-full px-4 py-2 mb-4 inline-block">
                    <span className="text-sm font-semibold uppercase tracking-wider">Since July 1, 2023</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Siemens Authorized Partner</h3>
                  <h4 className="text-xl font-semibold text-blue-600 mb-4">Smart Infrastructure, Electrical Product (SI EP)</h4>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    The innovative technologies we develop are fundamentally revolutionizing digital infrastructure at incredible speed and scale. By delivering an integrated collaborative ecosystem, we enable organizations to accelerate their digital transformation effectively, efficiently, and sustainably.
                  </p>
                  <p className="text-gray-600">
                    PT. Hokiindo Raya has been appointed as an official partner of Siemens SI EP since July 1, 2023.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 text-center">
                  <h3 className="text-3xl font-bold text-blue-800 mb-2">SIEMENS</h3>
                  <p className="text-blue-600 text-lg font-semibold">Smart Infrastructure</p>
                  <p className="text-blue-600">Electrical Products</p>
                </div>
              </div>
            </div>

            {/* G-Coming Partnership */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="order-2 lg:order-1">
                  <div className="bg-green-100 text-green-600 rounded-full px-4 py-2 mb-4 inline-block">
                    <span className="text-sm font-semibold uppercase tracking-wider">Since 2024</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">G-Coming Authorized Partner</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    PT. Hokiindo Raya has been appointed as G-Coming official partner since 2024. We cooperate with Shenzhen Coming Technology as an international standard lighting solutions supplier. All products have the highest quality which is very suitable for LED Industrial and Portable lightning products.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Products:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <span>• AutoGo series</span>
                      <span>• LiteGo series</span>
                      <span>• MateGo series</span>
                      <span>• TopGo series</span>
                      <span>• Pocket Light</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 text-center order-1 lg:order-2">
                  <h3 className="text-3xl font-bold text-green-800 mb-2">G-COMING</h3>
                  <p className="text-green-600 text-lg font-semibold">Lighting Solutions</p>
                  <p className="text-green-600">LED Industrial & Portable</p>
                </div>
              </div>
            </div>

            {/* Electrical Components */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Electrical Parts and Component Supply</h3>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  We provide a comprehensive range of high-quality electrical parts and components to support various industrial, commercial, and utility-scale applications.
                </p>
                <div className="mt-8 bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-8">
                  <h4 className="text-xl font-bold text-red-800 mb-4">Complete Solutions</h4>
                  <p className="text-red-600">
                    From retail to large project procurement with transparent process and professional customer service support, offering both online and offline purchasing systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl text-white p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Work Together?</h2>
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Let's discuss how our industrial automation solutions can power your business growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </a>
              <a
                href="tel:+62-21-1234-5678"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-all duration-200"
              >
                <Phone className="w-5 h-5" />
                +62 21 1234 5678
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 