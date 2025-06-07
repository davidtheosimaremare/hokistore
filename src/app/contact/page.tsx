"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  CheckCircle,
  AlertCircle,
  Building,
  Globe,
  Users
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

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

    if (contactRef.current) observer.observe(contactRef.current);
    return () => observer.disconnect();
  }, []);

  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      details: [
        "Jl. Sudirman No. 123, Blok A",
        "Jakarta Pusat, DKI Jakarta 10220",
        "Indonesia"
      ]
    },
    {
      icon: Phone,
      title: "Phone",
      details: [
        "+62 21 1234 5678",
        "+62 812 3456 7890",
        "Mon-Fri: 8:00 AM - 5:00 PM"
      ]
    },
    {
      icon: Mail,
      title: "Email",
      details: [
        "info@hokiindoraya.com",
        "sales@hokiindoraya.com",
        "support@hokiindoraya.com"
      ]
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [
        "Monday - Friday: 8:00 AM - 5:00 PM",
        "Saturday: 8:00 AM - 1:00 PM",
        "Sunday: Closed"
      ]
    }
  ];

  const departments = [
    {
      icon: Users,
      name: "Sales Team",
      email: "sales@hokiindoraya.com",
      description: "Product inquiries and quotations"
    },
    {
      icon: Building,
      name: "Technical Support",
      email: "support@hokiindoraya.com",
      description: "Installation and maintenance support"
    },
    {
      icon: Globe,
      name: "General Information",
      email: "info@hokiindoraya.com",
      description: "Company information and partnerships"
    }
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: ""
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Get in touch with our team for industrial automation solutions and expert consultation
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        {isSubmitted && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Message Sent Successfully!</h3>
              <p className="text-green-700">Thank you for contacting us. We'll get back to you within 24 hours.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div ref={contactRef}>
            <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${
                        errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${
                        errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="+62 812 3456 7890"
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Company */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${
                      errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a subject</option>
                    <option value="product-inquiry">Product Inquiry</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="quotation-request">Quotation Request</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="general">General Information</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none ${
                      errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Tell us about your requirements or questions..."
                  ></textarea>
                  {errors.message && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <info.icon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600">{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Departments */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact by Department</h3>
              <div className="space-y-4">
                {departments.map((dept, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors duration-200">
                    <div className="flex items-center gap-3 mb-2">
                      <dept.icon className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-gray-900">{dept.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{dept.description}</p>
                    <a
                      href={`mailto:${dept.email}`}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      {dept.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Our Office</h2>
              <p className="text-gray-600">
                Visit our headquarters in Jakarta for direct consultation and product demonstrations.
              </p>
            </div>
            
            {/* Embedded Google Map */}
            <div className="h-96 bg-gray-200 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.82058531476248!3d-6.200000062148568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2ad6e1e0e9bcc8!2sJl.%20Jenderal%20Sudirman%2C%20Jakarta%2C%20Indonesia!5e0!3m2!1sen!2sid!4v1647329919995!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hokiindo Raya Office Location"
              ></iframe>
              
              {/* Map Overlay Info */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-gray-900">Hokiindo Raya</span>
                </div>
                <p className="text-sm text-gray-600">
                  Jl. Sudirman No. 123, Jakarta Pusat
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl text-white p-8">
            <h3 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h3>
            <p className="text-red-100 mb-6">
              Our technical support team is ready to help you with urgent requirements
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+62-21-1234-5678"
                className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200"
              >
                <Phone className="w-5 h-5" />
                Call Now: +62 21 1234 5678
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-all duration-200"
              >
                💬 WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 