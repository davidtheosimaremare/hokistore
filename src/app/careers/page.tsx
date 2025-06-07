"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  Clock,
  Briefcase,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Building,
  Zap,
  Settings,
  HeadphonesIcon,
  Target,
  Award,
  Heart,
  Coffee,
  Wifi,
  Car,
  GraduationCap,
  Shield,
  Play
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: 'Full-Time' | 'Part-Time' | 'Internship' | 'Contract';
  postedDate: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  experience: string;
  salary?: string;
}

const jobs: Job[] = [
  {
    id: 1,
    title: "Senior Automation Engineer",
    department: "Engineering",
    location: "Jakarta",
    type: "Full-Time",
    postedDate: "2024-01-15",
    description: "Lead automation projects for industrial clients, specializing in SIMATIC systems and PLC programming. Drive innovation in smart factory implementations across Indonesia.",
    requirements: [
      "Bachelor's degree in Electrical/Automation Engineering",
      "5+ years experience with SIMATIC S7-1500/S7-1200 systems",
      "Proficiency in TIA Portal and HMI development",
      "Experience with industrial networks (Profinet, Profibus)",
      "Strong problem-solving and project management skills"
    ],
    responsibilities: [
      "Design and implement automation solutions for manufacturing clients",
      "Program and configure SIMATIC PLC systems",
      "Lead technical teams and mentor junior engineers",
      "Collaborate with sales team on technical proposals",
      "Provide on-site commissioning and troubleshooting support"
    ],
    benefits: [
      "Competitive salary with performance bonuses",
      "Health insurance for employee and family",
      "Professional development and Siemens certifications",
      "Flexible working arrangements",
      "Company car and travel allowances"
    ],
    experience: "5-8 years",
    salary: "IDR 180-250 Million/year"
  },
  {
    id: 2,
    title: "Technical Sales Representative",
    department: "Sales",
    location: "Surabaya",
    type: "Full-Time",
    postedDate: "2024-01-12",
    description: "Drive sales growth in East Java region, focusing on industrial automation solutions. Build relationships with manufacturing clients and provide technical expertise.",
    requirements: [
      "Bachelor's degree in Engineering or Business",
      "3+ years B2B technical sales experience",
      "Knowledge of industrial automation products",
      "Excellent communication and presentation skills",
      "Willingness to travel within East Java region"
    ],
    responsibilities: [
      "Identify and develop new business opportunities",
      "Present technical solutions to manufacturing clients",
      "Collaborate with engineering team on project proposals",
      "Achieve quarterly and annual sales targets",
      "Maintain strong relationships with existing clients"
    ],
    benefits: [
      "Base salary plus attractive commission structure",
      "Health and dental insurance",
      "Company vehicle and fuel allowance",
      "Sales incentive trips and bonuses",
      "Continuous sales training programs"
    ],
    experience: "3-5 years",
    salary: "IDR 120-180 Million/year + Commission"
  },
  {
    id: 3,
    title: "Electrical Design Engineer",
    department: "Engineering",
    location: "Bandung",
    type: "Full-Time",
    postedDate: "2024-01-10",
    description: "Design electrical systems and control panels for industrial applications. Work with cutting-edge SENTRON and power distribution technologies.",
    requirements: [
      "Bachelor's degree in Electrical Engineering",
      "2+ years experience in electrical design",
      "Proficiency in AutoCAD Electrical and EPLAN",
      "Knowledge of electrical standards (IEC, SNI)",
      "Experience with power distribution systems"
    ],
    responsibilities: [
      "Design electrical schematics and control panels",
      "Select appropriate electrical components and devices",
      "Ensure compliance with safety and industry standards",
      "Support installation and commissioning activities",
      "Create technical documentation and manuals"
    ],
    benefits: [
      "Competitive salary with annual increments",
      "Professional development opportunities",
      "Health insurance and medical benefits",
      "Work-life balance with flexible hours",
      "Modern office environment with latest tools"
    ],
    experience: "2-4 years",
    salary: "IDR 100-140 Million/year"
  },
  {
    id: 4,
    title: "Project Manager - Industrial Automation",
    department: "Operations",
    location: "Jakarta",
    type: "Full-Time",
    postedDate: "2024-01-08",
    description: "Manage end-to-end automation projects for major industrial clients. Ensure timely delivery and client satisfaction while coordinating cross-functional teams.",
    requirements: [
      "Bachelor's degree in Engineering or Project Management",
      "PMP certification preferred",
      "5+ years project management experience",
      "Experience in industrial automation projects",
      "Strong leadership and communication skills"
    ],
    responsibilities: [
      "Plan and execute automation projects from concept to delivery",
      "Coordinate engineering, procurement, and installation teams",
      "Manage project budgets, timelines, and resources",
      "Ensure quality standards and client satisfaction",
      "Present project updates to stakeholders and clients"
    ],
    benefits: [
      "Executive compensation package",
      "Performance-based bonuses and incentives",
      "Comprehensive health and life insurance",
      "Professional certification support",
      "Leadership development programs"
    ],
    experience: "5-7 years",
    salary: "IDR 200-280 Million/year"
  },
  {
    id: 5,
    title: "Technical Support Specialist",
    department: "Support",
    location: "Jakarta",
    type: "Full-Time",
    postedDate: "2024-01-05",
    description: "Provide technical support for SIMATIC and SENTRON products. Help clients optimize their automation systems and resolve technical challenges.",
    requirements: [
      "Diploma/Bachelor's in Electrical or Automation Engineering",
      "2+ years technical support experience",
      "Knowledge of SIMATIC and industrial communication",
      "Customer service orientation",
      "Problem-solving and analytical skills"
    ],
    responsibilities: [
      "Provide remote and on-site technical support",
      "Troubleshoot automation and electrical systems",
      "Conduct training sessions for client personnel",
      "Document technical issues and solutions",
      "Collaborate with engineering team on complex problems"
    ],
    benefits: [
      "Competitive salary with skill-based increments",
      "Health insurance and wellness programs",
      "Technical training and certification opportunities",
      "Flexible working hours",
      "Team building activities and events"
    ],
    experience: "2-3 years",
    salary: "IDR 80-120 Million/year"
  },
  {
    id: 6,
    title: "Marketing Communications Specialist",
    department: "Marketing",
    location: "Jakarta",
    type: "Full-Time",
    postedDate: "2024-01-03",
    description: "Develop marketing strategies and communications for industrial automation solutions. Create compelling content and manage digital marketing campaigns.",
    requirements: [
      "Bachelor's degree in Marketing, Communications, or related field",
      "3+ years B2B marketing experience",
      "Experience in industrial or technical marketing",
      "Strong writing and content creation skills",
      "Knowledge of digital marketing tools and analytics"
    ],
    responsibilities: [
      "Develop marketing campaigns and promotional materials",
      "Create technical content and case studies",
      "Manage social media and digital marketing efforts",
      "Support trade shows and industry events",
      "Analyze marketing performance and ROI"
    ],
    benefits: [
      "Creative work environment with growth opportunities",
      "Health insurance and wellness benefits",
      "Professional development in marketing",
      "Flexible work arrangements",
      "Event and conference attendance opportunities"
    ],
    experience: "3-5 years",
    salary: "IDR 100-150 Million/year"
  },
  {
    id: 7,
    title: "Automation Engineering Intern",
    department: "Engineering",
    location: "Jakarta",
    type: "Internship",
    postedDate: "2024-01-01",
    description: "Learn industrial automation through hands-on projects with experienced engineers. Gain exposure to SIMATIC systems and real-world implementations.",
    requirements: [
      "Currently pursuing degree in Electrical/Automation Engineering",
      "GPA 3.0 or higher",
      "Basic knowledge of PLCs and automation",
      "Eagerness to learn and strong work ethic",
      "Available for 6-month internship program"
    ],
    responsibilities: [
      "Assist engineers with automation project development",
      "Learn PLC programming and HMI development",
      "Support testing and commissioning activities",
      "Document project activities and learnings",
      "Participate in training sessions and workshops"
    ],
    benefits: [
      "Competitive internship stipend",
      "Mentorship from senior engineers",
      "Hands-on experience with latest technology",
      "Certificate of completion",
      "Potential for full-time employment"
    ],
    experience: "Entry Level",
    salary: "IDR 8-12 Million/month"
  },
  {
    id: 8,
    title: "Business Development Manager",
    department: "Sales",
    location: "Remote",
    type: "Full-Time",
    postedDate: "2023-12-28",
    description: "Identify and develop strategic partnerships and new market opportunities. Focus on expanding Hokiindo Raya's presence across Indonesia.",
    requirements: [
      "Bachelor's degree in Business or Engineering",
      "5+ years business development experience",
      "Experience in industrial or B2B sectors",
      "Strong networking and relationship-building skills",
      "Strategic thinking and market analysis abilities"
    ],
    responsibilities: [
      "Identify new market opportunities and partnerships",
      "Develop strategic business plans and proposals",
      "Build relationships with key industry stakeholders",
      "Analyze market trends and competitive landscape",
      "Support expansion into new geographical markets"
    ],
    benefits: [
      "Senior management compensation package",
      "Performance-based bonuses and equity options",
      "Comprehensive benefits package",
      "Remote work flexibility",
      "Strategic decision-making involvement"
    ],
    experience: "5+ years",
    salary: "IDR 220-300 Million/year"
  }
];

const departments = ["All Departments", "Engineering", "Sales", "Operations", "Support", "Marketing"];
const jobTypes = ["All Types", "Full-Time", "Part-Time", "Internship", "Contract"];
const locations = ["All Locations", "Jakarta", "Surabaya", "Bandung", "Remote"];

export default function CareersPage() {
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs);
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedJobType, setSelectedJobType] = useState("All Types");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const careersRef = useRef<HTMLDivElement>(null);

  const jobsPerPage = 5;

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

    if (careersRef.current) observer.observe(careersRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (selectedDepartment !== "All Departments") {
      filtered = filtered.filter(job => job.department === selectedDepartment);
    }

    if (selectedJobType !== "All Types") {
      filtered = filtered.filter(job => job.type === selectedJobType);
    }

    if (selectedLocation !== "All Locations") {
      filtered = filtered.filter(job => job.location === selectedLocation);
    }

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [selectedDepartment, selectedJobType, selectedLocation, searchTerm]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case "Engineering": return Settings;
      case "Sales": return Target;
      case "Operations": return Building;
      case "Support": return HeadphonesIcon;
      case "Marketing": return Users;
      default: return Briefcase;
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case "Full-Time": return "bg-green-100 text-green-800";
      case "Part-Time": return "bg-blue-100 text-blue-800";
      case "Internship": return "bg-purple-100 text-purple-800";
      case "Contract": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const resetFilters = () => {
    setSelectedDepartment("All Departments");
    setSelectedJobType("All Types");
    setSelectedLocation("All Locations");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto mb-8">
              Build your career with Indonesia's leading industrial automation solutions provider. 
              Help shape the future of manufacturing technology.
            </p>
            <div className="flex items-center justify-center gap-8 text-red-100">
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm">Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">15+</div>
                <div className="text-sm">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm">Projects Delivered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8" ref={careersRef}>
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm"
            >
              <span className="font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Sidebar Filters */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Find Your Role</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Jobs</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Job title or keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Job Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                <select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Results Count and Reset */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found</span>
                <button
                  onClick={resetFilters}
                  className="text-red-600 hover:text-red-700 font-semibold"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className={`flex-1 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {currentJobs.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                <button
                  onClick={resetFilters}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  View All Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {currentJobs.map((job, index) => {
                  const IconComponent = getDepartmentIcon(job.department);
                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
                      style={{ 
                        transitionDelay: `${index * 100}ms` 
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Job Header */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="bg-red-100 text-red-600 p-3 rounded-lg">
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-200">
                                {job.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Building className="w-4 h-4" />
                                  <span>{job.department}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(job.postedDate)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Job Description */}
                          <p className="text-gray-700 mb-4 line-clamp-2">
                            {job.description}
                          </p>

                          {/* Job Details */}
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getJobTypeColor(job.type)}`}>
                              {job.type}
                            </span>
                            <span className="text-sm text-gray-600">
                              {job.experience}
                            </span>
                            {job.salary && (
                              <span className="text-sm font-semibold text-green-600">
                                {job.salary}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 md:ml-6">
                          <Link href={`/careers/${job.id}`}>
                            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 whitespace-nowrap">
                              View Details
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                            </button>
                          </Link>
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap">
                            Apply Now
                          </button>
                        </div>
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
        </div>
      </div>

      {/* Working at Hokiindo Raya Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Work With Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join a team of passionate professionals driving innovation in industrial automation across Indonesia.
            </p>
          </div>

          {/* Company Culture Video */}
          <div className="relative mb-16">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=600&fit=crop" 
                alt="Hokiindo Raya Team" 
                className="w-full h-96 object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-full transition-all duration-200 hover:scale-110">
                  <Play className="w-8 h-8 ml-1" />
                </button>
              </div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Our Culture & Values</h3>
                <p className="text-red-100">See what makes Hokiindo Raya a great place to work</p>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="text-center group">
              <div className="bg-red-100 text-red-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Health & Wellness</h3>
              <p className="text-gray-600">Comprehensive health insurance, dental coverage, and wellness programs for you and your family.</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-red-100 text-red-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Professional Growth</h3>
              <p className="text-gray-600">Continuous learning opportunities, Siemens certifications, and career advancement programs.</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-red-100 text-red-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Work-Life Balance</h3>
              <p className="text-gray-600">Flexible working hours, remote work options, and generous vacation policies.</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-red-100 text-red-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Car className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Transportation</h3>
              <p className="text-gray-600">Company vehicles, fuel allowances, and transportation support for field work.</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-red-100 text-red-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Recognition</h3>
              <p className="text-gray-600">Performance bonuses, annual awards, and recognition programs that celebrate achievements.</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-red-100 text-red-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Job Security</h3>
              <p className="text-gray-600">Stable employment with a growing company, competitive retirement plans, and long-term career paths.</p>
            </div>
          </div>

          {/* Employee Testimonials */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">What Our Team Says</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face" 
                    alt="Budi Santoso" 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">Budi Santoso</h4>
                    <p className="text-gray-600 text-sm">Senior Automation Engineer</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Working at Hokiindo Raya has been an incredible journey. The company invests heavily in our professional development, and I've gained certifications that have advanced my career significantly."
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b593?w=60&h=60&fit=crop&crop=face" 
                    alt="Sari Wulandari" 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">Sari Wulandari</h4>
                    <p className="text-gray-600 text-sm">Technical Sales Representative</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "The collaborative culture here is amazing. Everyone supports each other, and management truly cares about work-life balance. It's the best team I've ever worked with."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join Our Team?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Take the next step in your career with Indonesia's leading industrial automation company. 
            Browse our open positions and apply today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200">
              View All Positions
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200">
              Contact HR Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 