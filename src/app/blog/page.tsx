"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Clock,
  User,
  Tag,
  ArrowRight,
  TrendingUp,
  Zap,
  Settings,
  Building,
  Factory,
  Shield,
  BookOpen
} from "lucide-react";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  publishDate: string;
  readTime: number;
  image: string;
  featured: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "future-of-industrial-automation-indonesia",
    title: "The Future of Industrial Automation in Indonesia: Trends and Opportunities",
    excerpt: "Explore how Industry 4.0 technologies are transforming manufacturing landscapes across Indonesia, from smart factories to predictive maintenance systems.",
    content: "",
    category: "Industry Insights",
    tags: ["Industry 4.0", "Automation", "Smart Factory", "Indonesia"],
    author: {
      name: "Dr. Agus Prasetyo",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      bio: "Senior Industrial Automation Consultant with 15+ years experience in manufacturing optimization."
    },
    publishDate: "2024-01-15",
    readTime: 8,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=400&fit=crop",
    featured: true
  },
  {
    id: 2,
    slug: "siemens-simatic-s7-1500-comprehensive-guide",
    title: "SIMATIC S7-1500: A Comprehensive Guide to Advanced PLC Programming",
    excerpt: "Learn advanced programming techniques, best practices, and real-world applications of Siemens SIMATIC S7-1500 controllers in industrial environments.",
    content: "",
    category: "Technical Guide",
    tags: ["SIMATIC", "PLC", "Programming", "Siemens"],
    author: {
      name: "Ir. Budi Santoso",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      bio: "Certified Siemens Engineer and Technical Training Specialist with expertise in automation systems."
    },
    publishDate: "2024-01-12",
    readTime: 12,
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=400&fit=crop",
    featured: false
  },
  {
    id: 3,
    slug: "energy-efficiency-electrical-systems",
    title: "Maximizing Energy Efficiency in Industrial Electrical Systems",
    excerpt: "Discover practical strategies and technologies to reduce energy consumption and operational costs in industrial electrical installations.",
    content: "",
    category: "Energy Management",
    tags: ["Energy Efficiency", "SENTRON", "Power Management", "Sustainability"],
    author: {
      name: "Sari Wulandari, M.T.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b593?w=100&h=100&fit=crop&crop=face",
      bio: "Energy Management Specialist focused on sustainable industrial solutions and green technology implementation."
    },
    publishDate: "2024-01-10",
    readTime: 6,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=400&fit=crop",
    featured: false
  },
  {
    id: 4,
    slug: "predictive-maintenance-industrial-equipment",
    title: "Implementing Predictive Maintenance for Industrial Equipment",
    excerpt: "How IoT sensors and AI analytics are revolutionizing maintenance strategies, reducing downtime and extending equipment lifespan.",
    content: "",
    category: "Maintenance Strategy",
    tags: ["Predictive Maintenance", "IoT", "AI", "Equipment Management"],
    author: {
      name: "Dr. Rahman Hidayat",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
      bio: "Industrial IoT researcher and maintenance optimization expert with focus on data-driven solutions."
    },
    publishDate: "2024-01-08",
    readTime: 10,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop",
    featured: true
  },
  {
    id: 5,
    slug: "safety-standards-industrial-automation",
    title: "Safety Standards and Best Practices in Industrial Automation",
    excerpt: "Understanding international safety standards, risk assessment methodologies, and implementation strategies for safer industrial operations.",
    content: "",
    category: "Safety & Compliance",
    tags: ["Safety Standards", "Risk Assessment", "Compliance", "Industrial Safety"],
    author: {
      name: "Ir. Dewi Maharani",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
      bio: "Safety Engineering Consultant specializing in industrial automation safety systems and compliance."
    },
    publishDate: "2024-01-05",
    readTime: 9,
    image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=400&fit=crop",
    featured: false
  },
  {
    id: 6,
    slug: "smart-building-automation-trends",
    title: "Smart Building Automation: Current Trends and Future Outlook",
    excerpt: "Explore the latest developments in building management systems, energy optimization, and user comfort enhancement technologies.",
    content: "",
    category: "Building Automation",
    tags: ["Smart Buildings", "BMS", "Energy Optimization", "IoT"],
    author: {
      name: "Arief Wibowo, S.T.",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face",
      bio: "Building automation specialist with expertise in integrated systems and sustainable building technologies."
    },
    publishDate: "2024-01-03",
    readTime: 7,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop",
    featured: false
  },
  {
    id: 7,
    slug: "digitalization-manufacturing-processes",
    title: "Digital Transformation in Manufacturing: A Practical Roadmap",
    excerpt: "Step-by-step guide to implementing digital technologies in traditional manufacturing processes, with real case studies and ROI analysis.",
    content: "",
    category: "Digital Transformation",
    tags: ["Digitalization", "Manufacturing", "ROI", "Case Studies"],
    author: {
      name: "Prof. Dr. Hendro Kusuma",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      bio: "Manufacturing Technology Professor and Industry 4.0 transformation consultant for leading corporations."
    },
    publishDate: "2024-01-01",
    readTime: 11,
    image: "https://images.unsplash.com/photo-1582731494355-8c8d30b9f1b3?w=800&h=400&fit=crop",
    featured: false
  },
  {
    id: 8,
    slug: "water-treatment-automation-solutions",
    title: "Advanced Automation Solutions for Water Treatment Plants",
    excerpt: "Comprehensive overview of SCADA systems, remote monitoring, and process optimization in municipal and industrial water treatment facilities.",
    content: "",
    category: "Water Management",
    tags: ["SCADA", "Water Treatment", "Process Control", "Remote Monitoring"],
    author: {
      name: "Dr. Indira Sari",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
      bio: "Environmental Engineer specializing in water treatment automation and sustainable water management systems."
    },
    publishDate: "2023-12-28",
    readTime: 8,
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop",
    featured: false
  }
];

const categories = ["All", "Industry Insights", "Technical Guide", "Energy Management", "Maintenance Strategy", "Safety & Compliance", "Building Automation", "Digital Transformation", "Water Management"];

export default function BlogPage() {
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(blogPosts);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const blogRef = useRef<HTMLDivElement>(null);

  const postsPerPage = 6;

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

    if (blogRef.current) observer.observe(blogRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let filtered = blogPosts;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);
  const featuredPosts = blogPosts.filter(post => post.featured);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Industry Insights": return TrendingUp;
      case "Technical Guide": return Settings;
      case "Energy Management": return Zap;
      case "Maintenance Strategy": return Factory;
      case "Safety & Compliance": return Shield;
      case "Building Automation": return Building;
      case "Digital Transformation": return BookOpen;
      case "Water Management": return Shield;
      default: return BookOpen;
    }
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSearchTerm("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Industry Insights & Updates</h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Stay informed with the latest trends, technologies, and best practices in industrial automation and electrical systems
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredPosts.slice(0, 2).map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime} min read</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-200">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(post.publishDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-red-600 font-semibold">
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles by title, content, tags, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
            />
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-between border border-gray-300"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Categories
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Category Filter */}
                <div className="min-w-0">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full md:w-56 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results and Reset */}
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
                </span>
                <button
                  onClick={resetFilters}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12" ref={blogRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentPosts.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Articles Found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <button
                onClick={resetFilters}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                View All Articles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPosts.map((post, index) => {
                const IconComponent = getCategoryIcon(post.category);
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <div
                      className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 group ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{ 
                        transitionDelay: `${index * 100}ms` 
                      }}
                    >
                      {/* Post Image */}
                      <div className="relative overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4">
                          <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                            <IconComponent className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="p-6">
                        {/* Category and Read Time */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                            {post.category}
                          </span>
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime} min</span>
                          </div>
                        </div>

                        {/* Post Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
                          {post.title}
                        </h3>

                        {/* Post Excerpt */}
                        <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Author and Date */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(post.publishDate)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-red-600 font-semibold text-sm">
                            <span>Read</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                        currentPage === pageNumber
                          ? 'bg-red-600 text-white'
                          : 'bg-white hover:bg-gray-50 border border-gray-300 text-gray-700'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated with Industry Insights
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Subscribe to our newsletter and receive the latest articles, industry trends, and technical insights directly in your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
              Subscribe
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            No spam, unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </section>
    </div>
  );
} 