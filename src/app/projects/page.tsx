"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Calendar,
  MapPin,
  Building,
  Factory,
  Zap,
  Settings,
  Cpu,
  Database,
  Shield
} from "lucide-react";

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  year: number;
  client: string;
  location: string;
  image: string;
  tags: string[];
  completionDate: string;
  projectValue: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Automotive Assembly Line Automation",
    description: "Complete PLC-based automation system for automotive parts assembly with SIMATIC S7-1500 controllers and HMI integration.",
    category: "Manufacturing Automation",
    year: 2024,
    client: "PT Astra Manufacturing",
    location: "Karawang, West Java",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop",
    tags: ["PLC", "SIMATIC", "HMI", "Assembly Line"],
    completionDate: "March 2024",
    projectValue: "IDR 2.5 Billion"
  },
  {
    id: 2,
    title: "Power Distribution Panel Upgrade",
    description: "Industrial electrical panel modernization with SENTRON protection devices and energy monitoring systems.",
    category: "Electrical Systems",
    year: 2024,
    client: "PT Indofood Sukses Makmur",
    location: "Jakarta, Indonesia",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop",
    tags: ["SENTRON", "Power Distribution", "Energy Monitoring"],
    completionDate: "January 2024",
    projectValue: "IDR 1.8 Billion"
  },
  {
    id: 3,
    title: "Warehouse Management System",
    description: "Automated storage and retrieval system with RFID tracking and SINAMICS drive technology for optimal efficiency.",
    category: "Warehouse Automation",
    year: 2023,
    client: "PT Mayora Indah",
    location: "Tangerang, Banten",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
    tags: ["SINAMICS", "RFID", "Automation", "Warehouse"],
    completionDate: "November 2023",
    projectValue: "IDR 3.2 Billion"
  },
  {
    id: 4,
    title: "Chemical Processing Plant Control",
    description: "Safety-critical process control system with redundant PLC architecture and advanced safety instrumented systems.",
    category: "Process Control",
    year: 2023,
    client: "PT Chandra Asri Petrochemical",
    location: "Cilegon, Banten",
    image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&h=400&fit=crop",
    tags: ["Process Control", "Safety Systems", "Redundancy"],
    completionDate: "September 2023",
    projectValue: "IDR 4.7 Billion"
  },
  {
    id: 5,
    title: "Smart Building Energy Management",
    description: "Comprehensive building automation with LOGO! controllers for lighting, HVAC, and energy optimization systems.",
    category: "Building Automation",
    year: 2023,
    client: "Wisma BCA Tower",
    location: "Jakarta, Indonesia",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
    tags: ["LOGO!", "HVAC", "Energy Management", "Smart Building"],
    completionDate: "August 2023",
    projectValue: "IDR 1.4 Billion"
  },
  {
    id: 6,
    title: "Textile Manufacturing Control",
    description: "Multi-zone temperature and humidity control system with precision motor control for textile production optimization.",
    category: "Manufacturing Automation",
    year: 2023,
    client: "PT Pan Brothers",
    location: "Tangerang, Banten",
    image: "https://images.unsplash.com/photo-1582731494355-8c8d30b9f1b3?w=600&h=400&fit=crop",
    tags: ["Motor Control", "Temperature Control", "Manufacturing"],
    completionDate: "June 2023",
    projectValue: "IDR 2.1 Billion"
  },
  {
    id: 7,
    title: "Water Treatment Plant Automation",
    description: "Complete SCADA system for municipal water treatment with remote monitoring and predictive maintenance capabilities.",
    category: "Water Management",
    year: 2022,
    client: "PDAM Tirta Dharma",
    location: "Surabaya, East Java",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop",
    tags: ["SCADA", "Water Treatment", "Remote Monitoring"],
    completionDate: "December 2022",
    projectValue: "IDR 3.8 Billion"
  },
  {
    id: 8,
    title: "Steel Mill Process Optimization",
    description: "High-performance drive systems and process control for steel production with real-time quality monitoring.",
    category: "Heavy Industry",
    year: 2022,
    client: "PT Krakatau Steel",
    location: "Cilegon, Banten",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=400&fit=crop",
    tags: ["Steel Production", "Drive Systems", "Quality Control"],
    completionDate: "October 2022",
    projectValue: "IDR 6.2 Billion"
  },
  {
    id: 9,
    title: "Pharmaceutical Clean Room Systems",
    description: "Critical environment control with precision air handling and contamination monitoring for pharmaceutical production.",
    category: "Pharmaceutical",
    year: 2022,
    client: "PT Kalbe Farma",
    location: "Jakarta, Indonesia",
    image: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&h=400&fit=crop",
    tags: ["Clean Room", "Air Handling", "Pharmaceutical"],
    completionDate: "August 2022",
    projectValue: "IDR 2.9 Billion"
  }
];

const categories = ["All", "Manufacturing Automation", "Electrical Systems", "Warehouse Automation", "Process Control", "Building Automation", "Water Management", "Heavy Industry", "Pharmaceutical"];
const years = [2024, 2023, 2022, 2021, 2020];

export default function ProjectsPage() {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const projectsRef = useRef<HTMLDivElement>(null);

  const projectsPerPage = 6;

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

    if (projectsRef.current) observer.observe(projectsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    if (selectedYear) {
      filtered = filtered.filter(project => project.year === selectedYear);
    }

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [selectedCategory, selectedYear, searchTerm]);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Manufacturing Automation": return Factory;
      case "Electrical Systems": return Zap;
      case "Warehouse Automation": return Database;
      case "Process Control": return Settings;
      case "Building Automation": return Building;
      case "Water Management": return Shield;
      case "Heavy Industry": return Cpu;
      case "Pharmaceutical": return Shield;
      default: return Factory;
    }
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedYear(null);
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Projects</h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Discover our portfolio of successful industrial automation and electrical solutions 
              delivered to leading companies across Indonesia
            </p>
            <div className="flex items-center justify-center gap-8 mt-8 text-red-100">
              <div className="text-center">
                <div className="text-2xl font-bold">150+</div>
                <div className="text-sm">Completed Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">15+</div>
                <div className="text-sm">Industries Served</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm">Satisfied Clients</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects by name, client, or technology..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
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
                    className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div className="min-w-0">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                  <select
                    value={selectedYear || ""}
                    onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full md:w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">All Years</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results and Reset */}
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
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

      {/* Projects Grid */}
      <section className="py-12" ref={projectsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentProjects.length === 0 ? (
            <div className="text-center py-16">
              <Factory className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <button
                onClick={resetFilters}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                View All Projects
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentProjects.map((project, index) => {
                const IconComponent = getCategoryIcon(project.category);
                return (
                  <div
                    key={project.id}
                    className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 group ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{ 
                      transitionDelay: `${index * 100}ms` 
                    }}
                  >
                    {/* Project Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                          <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Project Content */}
                    <div className="p-6">
                      {/* Category Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                          {project.category}
                        </span>
                      </div>

                      {/* Project Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-200">
                        {project.title}
                      </h3>

                      {/* Project Description */}
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {project.description}
                      </p>

                      {/* Project Meta */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Building className="w-4 h-4" />
                          <span>{project.client}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{project.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{project.completionDate}</span>
                        </div>
                      </div>

                      {/* Project Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                            +{project.tags.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* View Details Button */}
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
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

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Next Project?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join hundreds of satisfied clients who trust Hokiindo Raya for their industrial automation 
            and electrical solutions. Let's discuss your project requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200">
              Get Free Consultation
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200">
              Download Brochure
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 