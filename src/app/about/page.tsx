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
  Mail
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
    { icon: Award, value: "15+", label: "Years Experience" },
    { icon: Globe, value: "50+", label: "Cities Served" },
    { icon: Zap, value: "1000+", label: "Projects Completed" }
  ];

  const timeline = [
    {
      year: "2008",
      title: "Company Founded",
      description: "Hokiindo Raya was established with a vision to provide premium electrical solutions for industrial needs."
    },
    {
      year: "2012",
      title: "Siemens Partnership",
      description: "Became an official distributor of Siemens industrial automation products in Indonesia."
    },
    {
      year: "2015",
      title: "G-Comin Collaboration",
      description: "Expanded partnerships to include G-Comin electrical components and solutions."
    },
    {
      year: "2018",
      title: "Digital Transformation",
      description: "Launched our digital platform to serve customers with modern e-commerce solutions."
    },
    {
      year: "2021",
      title: "Industry Recognition",
      description: "Received multiple certifications and awards for excellence in industrial automation."
    },
    {
      year: "2024",
      title: "Innovation Hub",
      description: "Established innovation center for smart industrial solutions and IoT integration."
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
      <section className="relative bg-gradient-to-r from-red-600 to-red-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img
          src="https://images.unsplash.com/photo-1581091878368-de3e48b79efc?w=1600&h=800&fit=crop"
          alt="Industrial Facility"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About Hokiindo Raya
            </h1>
            <p className="text-xl md:text-2xl text-red-100 max-w-4xl mx-auto mb-8">
              Your Trusted Solution Partner in Industrial Automation & Electrical Engineering
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-red-200" />
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-red-100">{stat.label}</div>
                </div>
              ))}
            </div>
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
                Founded in 2008, Hokiindo Raya began as a small electrical solutions provider with a big vision: 
                to become Indonesia's leading distributor of premium industrial automation equipment.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Over the years, we have grown from a local supplier to a trusted nationwide partner, 
                serving hundreds of industrial clients across Indonesia. Our commitment to quality, 
                innovation, and customer satisfaction has made us the preferred choice for businesses 
                seeking reliable electrical solutions.
              </p>
              <p className="text-lg text-gray-600">
                Today, we proudly serve as an official distributor for world-renowned brands like 
                Siemens and G-Comin, bringing cutting-edge technology and expertise to Indonesian industries.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop"
                alt="Our Team"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-red-600 text-white p-6 rounded-xl shadow-lg">
                <div className="text-2xl font-bold">15+</div>
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
                <p className="text-gray-700 leading-relaxed">
                  To provide innovative, reliable, and cost-effective electrical solutions that empower 
                  Indonesian industries to achieve operational excellence and sustainable growth through 
                  cutting-edge automation technology.
                </p>
              </div>
              <div className="p-8 md:p-12 bg-gradient-to-br from-blue-50 to-blue-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-700 leading-relaxed">
                  To be the leading industrial automation solutions provider in Southeast Asia, 
                  recognized for our technical expertise, customer-centric approach, and contribution 
                  to industrial innovation and digital transformation.
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

        {/* Partnerships */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Partners</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted partnerships with world-leading brands and technology providers
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <div className="bg-blue-100 rounded-xl p-8 mb-4">
                  <h3 className="text-2xl font-bold text-blue-800">SIEMENS</h3>
                  <p className="text-blue-600 mt-2">Official Distributor</p>
                </div>
                <p className="text-gray-600">
                  Leading global technology company focusing on industry, infrastructure, transport, and healthcare.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-xl p-8 mb-4">
                  <h3 className="text-2xl font-bold text-green-800">G-COMIN</h3>
                  <p className="text-green-600 mt-2">Authorized Partner</p>
                </div>
                <p className="text-gray-600">
                  Innovative electrical components and automation solutions for modern industrial applications.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-red-100 rounded-xl p-8 mb-4">
                  <h3 className="text-2xl font-bold text-red-800">ISO</h3>
                  <p className="text-red-600 mt-2">Certified Quality</p>
                </div>
                <p className="text-gray-600">
                  International standards certification ensuring quality management and customer satisfaction.
                </p>
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