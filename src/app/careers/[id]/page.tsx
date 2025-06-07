"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Building,
  Briefcase,
  Users,
  CheckCircle,
  X,
  Upload,
  FileText,
  Send,
  Settings,
  Target,
  HeadphonesIcon,
  ArrowRight,
  Bookmark,
  Share2,
  Heart,
  Award,
  GraduationCap,
  Car,
  Coffee,
  Shield
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

// Sample job data (same as careers page)
const jobs: Job[] = [
  {
    id: 1,
    title: "Senior Automation Engineer",
    department: "Engineering",
    location: "Jakarta",
    type: "Full-Time",
    postedDate: "2024-01-15",
    description: "Lead automation projects for industrial clients, specializing in SIMATIC systems and PLC programming. Drive innovation in smart factory implementations across Indonesia. You will work with cutting-edge technology to design, implement, and optimize automation solutions for major manufacturing clients across various industries including automotive, food & beverage, textiles, and petrochemicals.",
    requirements: [
      "Bachelor's degree in Electrical/Automation Engineering",
      "5+ years experience with SIMATIC S7-1500/S7-1200 systems",
      "Proficiency in TIA Portal and HMI development",
      "Experience with industrial networks (Profinet, Profibus)",
      "Strong problem-solving and project management skills",
      "Excellent communication skills in English and Bahasa Indonesia",
      "Willingness to travel for project implementations",
      "Knowledge of safety standards (IEC 61508, IEC 62061)"
    ],
    responsibilities: [
      "Design and implement automation solutions for manufacturing clients",
      "Program and configure SIMATIC PLC systems using TIA Portal",
      "Lead technical teams and mentor junior engineers",
      "Collaborate with sales team on technical proposals and cost estimation",
      "Provide on-site commissioning and troubleshooting support",
      "Conduct training sessions for client technical teams",
      "Ensure compliance with international and local safety standards",
      "Document project specifications and create technical manuals"
    ],
    benefits: [
      "Competitive salary with performance bonuses",
      "Health insurance for employee and family",
      "Professional development and Siemens certifications",
      "Flexible working arrangements",
      "Company car and travel allowances",
      "Annual performance reviews and salary adjustments",
      "Team building activities and company retreats",
      "Professional conference and training attendance"
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
  }
];

export default function JobDetailPage() {
  const params = useParams();
  const jobId = parseInt(params.id as string);
  
  const [job, setJob] = useState<Job | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Application form state
  const [applicationForm, setApplicationForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    resume: null as File | null,
    linkedinUrl: "",
    coverLetter: "",
    agreedToTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Find the current job
  useEffect(() => {
    const foundJob = jobs.find(j => j.id === jobId);
    setJob(foundJob || null);
  }, [jobId]);

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

    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-8">The job position you're looking for doesn't exist.</p>
          <Link href="/careers" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
            Back to Careers
          </Link>
        </div>
      </div>
    );
  }

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

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    // Close modal after success message
    setTimeout(() => {
      setShowApplicationModal(false);
      setSubmitSuccess(false);
      setApplicationForm({
        fullName: "",
        email: "",
        phone: "",
        resume: null,
        linkedinUrl: "",
        coverLetter: "",
        agreedToTerms: false
      });
    }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setApplicationForm(prev => ({ ...prev, resume: file }));
    }
  };

  const IconComponent = getDepartmentIcon(job.department);
  const relatedJobs = jobs.filter(j => j.id !== job.id && j.department === job.department).slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/careers" className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-200">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Careers</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {/* Job Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-red-100 text-red-600 p-4 rounded-xl">
                  <IconComponent className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getJobTypeColor(job.type)}`}>
                      {job.type}
                    </span>
                    <span className="text-gray-500 text-sm">Posted {formatDate(job.postedDate)}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{job.experience}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <span>{job.salary}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About This Role</h2>
                <p className="text-gray-700 leading-relaxed">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Sticky Action Panel */}
            <div className="lg:w-80">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
                <div className="space-y-4">
                  <button 
                    onClick={() => setShowApplicationModal(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className={`flex-1 border border-gray-300 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 ${
                        isBookmarked ? 'bg-red-50 text-red-600 border-red-300' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      {isBookmarked ? 'Saved' : 'Save'}
                    </button>
                    
                    <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-semibold">{job.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold">{job.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-semibold">{job.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold">{job.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Details */}
      <section className="py-12" ref={contentRef}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Responsibilities */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-red-600" />
                  Responsibilities
                </h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-red-600" />
                  Requirements
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-600" />
                  Benefits
                </h2>
                <ul className="space-y-3">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Jobs */}
      {relatedJobs.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Other {job.department} Positions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedJobs.map((relatedJob) => {
                const RelatedIconComponent = getDepartmentIcon(relatedJob.department);
                return (
                  <Link key={relatedJob.id} href={`/careers/${relatedJob.id}`}>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="bg-red-100 text-red-600 p-3 rounded-lg">
                          <RelatedIconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-200">
                            {relatedJob.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span>{relatedJob.location}</span>
                            <span>{relatedJob.type}</span>
                          </div>
                          <p className="text-gray-700 text-sm line-clamp-2">
                            {relatedJob.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getJobTypeColor(relatedJob.type)}`}>
                          {relatedJob.type}
                        </span>
                        <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                          <span>View Position</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h2>
              <button 
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-600 mb-4">
                  Thank you for your interest in joining our team. We'll review your application and get back to you within 5-7 business days.
                </p>
                <p className="text-sm text-gray-500">
                  You'll receive a confirmation email shortly with the next steps.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="p-6 space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicationForm.fullName}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={applicationForm.email}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={applicationForm.phone}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="+62 xxx xxx xxxx"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      LinkedIn URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={applicationForm.linkedinUrl}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="https://linkedin.com/in/yourname"
                    />
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Resume/CV *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors duration-200">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                      required
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-1">
                        {applicationForm.resume ? applicationForm.resume.name : "Click to upload your resume"}
                      </p>
                      <p className="text-sm text-gray-500">PDF, DOC, DOCX (Max 5MB)</p>
                    </label>
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cover Letter / Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={applicationForm.coverLetter}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                  />
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={applicationForm.agreedToTerms}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the <a href="#" className="text-red-600 hover:text-red-700">Terms & Conditions</a> and <a href="#" className="text-red-600 hover:text-red-700">Privacy Policy</a>. I consent to the processing of my personal data for recruitment purposes.
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 