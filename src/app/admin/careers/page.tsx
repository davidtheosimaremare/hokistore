"use client";

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  UserCheck, 
  Plus,
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Briefcase,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  Star,
  Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface CareerPosting {
  id: string
  title: string
  slug: string
  department: string
  location: string
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship'
  experience_level: 'entry_level' | 'mid_level' | 'senior_level' | 'executive'
  salary_range: string | null
  job_description: string
  requirements: string
  skills_required: string[] | null
  application_deadline: string | null
  is_active: boolean
  is_featured: boolean
  remote_friendly: boolean
  created_at: string
}

interface JobApplication {
  id: string
  career_posting_id: string
  applicant_name: string
  applicant_email: string
  applicant_phone: string | null
  current_position: string | null
  current_company: string | null
  experience_years: number | null
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'interviewed' | 'rejected' | 'hired'
  created_at: string
}

export default function CareersPage() {
  const [careerPostings, setCareerPostings] = useState<CareerPosting[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [filteredPostings, setFilteredPostings] = useState<CareerPosting[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('postings')
  const [departments, setDepartments] = useState<string[]>([])

  useEffect(() => {
    loadCareersData()
  }, [])

  useEffect(() => {
    filterPostings()
  }, [careerPostings, searchQuery, selectedDepartment, selectedStatus])

  const loadCareersData = async () => {
    try {
      setLoading(true)

      // Load career postings
      const { data: postingsData, error: postingsError } = await supabase
        .from('career_postings')
        .select('*')
        .order('created_at', { ascending: false })

      if (postingsError) {
        console.error('Error loading career postings:', postingsError)
      } else if (postingsData) {
        setCareerPostings(postingsData)
        
        // Extract unique departments
        const uniqueDepartments = [...new Set(postingsData.map(posting => posting.department).filter(Boolean))]
        setDepartments(uniqueDepartments)
      }

      // Load applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (applicationsError) {
        console.error('Error loading applications:', applicationsError)
      } else if (applicationsData) {
        setApplications(applicationsData)
      }

    } catch (error) {
      console.error('Error loading careers data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPostings = () => {
    let filtered = careerPostings

    if (searchQuery) {
      filtered = filtered.filter(posting =>
        posting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        posting.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        posting.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedDepartment) {
      filtered = filtered.filter(posting => posting.department === selectedDepartment)
    }

    if (selectedStatus === 'active') {
      filtered = filtered.filter(posting => posting.is_active)
    } else if (selectedStatus === 'inactive') {
      filtered = filtered.filter(posting => !posting.is_active)
    }

    setFilteredPostings(filtered)
  }

  const handleDeletePosting = async (postingId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('career_postings')
        .delete()
        .eq('id', postingId)

      if (error) {
        console.error('Error deleting career posting:', error)
        return
      }

      setCareerPostings(careerPostings.filter(p => p.id !== postingId))
    } catch (error) {
      console.error('Error deleting career posting:', error)
    }
  }

  const handleToggleActive = async (postingId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('career_postings')
        .update({ is_active: !currentStatus })
        .eq('id', postingId)

      if (error) {
        console.error('Error updating career posting:', error)
        return
      }

      setCareerPostings(careerPostings.map(p => 
        p.id === postingId ? { ...p, is_active: !currentStatus } : p
      ))
    } catch (error) {
      console.error('Error updating career posting:', error)
    }
  }

  const handleToggleFeatured = async (postingId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('career_postings')
        .update({ is_featured: !currentStatus })
        .eq('id', postingId)

      if (error) {
        console.error('Error updating career posting:', error)
        return
      }

      setCareerPostings(careerPostings.map(p => 
        p.id === postingId ? { ...p, is_featured: !currentStatus } : p
      ))
    } catch (error) {
      console.error('Error updating career posting:', error)
    }
  }

  const handleApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId)

      if (error) {
        console.error('Error updating application status:', error)
        return
      }

      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus as any } : app
      ))
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEmploymentTypeBadge = (type: string) => {
    const typeConfig = {
      full_time: { color: 'bg-green-100 text-green-800', label: 'Full Time' },
      part_time: { color: 'bg-blue-100 text-blue-800', label: 'Part Time' },
      contract: { color: 'bg-yellow-100 text-yellow-800', label: 'Contract' },
      internship: { color: 'bg-purple-100 text-purple-800', label: 'Internship' }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.full_time
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getApplicationStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      reviewing: { color: 'bg-yellow-100 text-yellow-800', label: 'Reviewing' },
      shortlisted: { color: 'bg-purple-100 text-purple-800', label: 'Shortlisted' },
      interviewed: { color: 'bg-indigo-100 text-indigo-800', label: 'Interviewed' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      hired: { color: 'bg-green-100 text-green-800', label: 'Hired' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDepartment('')
    setSelectedStatus('')
  }

  // Calculate stats
  const activePostings = careerPostings.filter(p => p.is_active).length
  const featuredPostings = careerPostings.filter(p => p.is_featured).length
  const totalApplications = applications.length
  const pendingApplications = applications.filter(app => app.status === 'submitted').length

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Careers</h1>
            <p className="text-gray-600 text-sm">Manage job postings and applications</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Job Posting</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Postings</p>
                <p className="text-2xl font-bold text-gray-900">{careerPostings.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600">{activePostings}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-purple-600">{totalApplications}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">{pendingApplications}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('postings')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'postings'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Briefcase className="w-4 h-4 inline mr-2" />
                Job Postings ({careerPostings.length})
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Applications ({applications.length})
              </button>
            </nav>
          </div>

          {activeTab === 'postings' && (
            <div className="p-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search job postings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {(searchQuery || selectedDepartment || selectedStatus) && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Job Postings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPostings.map((posting) => (
                  <div key={posting.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{posting.title}</h3>
                      <div className="flex items-center space-x-1 ml-2">
                        {posting.is_featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        <div className={`w-3 h-3 rounded-full ${posting.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {posting.department}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {posting.location}
                        {posting.remote_friendly && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Remote OK</span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(posting.created_at)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      {getEmploymentTypeBadge(posting.employment_type)}
                      {posting.salary_range && (
                        <span className="text-sm font-medium text-gray-900">{posting.salary_range}</span>
                      )}
                    </div>
                    
                    {posting.skills_required && posting.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {posting.skills_required.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {posting.skills_required.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{posting.skills_required.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleToggleActive(posting.id, posting.is_active)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            posting.is_active 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {posting.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleToggleFeatured(posting.id, posting.is_featured)}
                          className={`p-1 rounded ${posting.is_featured ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                        >
                          <Star className={`w-4 h-4 ${posting.is_featured ? 'fill-current' : ''}`} />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePosting(posting.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPostings.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No job postings found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first job posting.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="p-4">
              <div className="space-y-4">
                {applications.map((application) => {
                  const relatedPosting = careerPostings.find(p => p.id === application.career_posting_id)
                  
                  return (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{application.applicant_name}</h4>
                            {getApplicationStatusBadge(application.status)}
                          </div>
                          
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2" />
                              {application.applicant_email}
                            </div>
                            {application.applicant_phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 mr-2" />
                                {application.applicant_phone}
                              </div>
                            )}
                            {application.current_position && application.current_company && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Briefcase className="w-4 h-4 mr-2" />
                                {application.current_position} at {application.current_company}
                              </div>
                            )}
                          </div>
                          
                          {relatedPosting && (
                            <div className="bg-gray-50 p-2 rounded mb-3">
                              <p className="text-sm font-medium text-gray-900">Applied for: {relatedPosting.title}</p>
                              <p className="text-xs text-gray-500">{relatedPosting.department} • {relatedPosting.location}</p>
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-500">Applied on {formatDate(application.created_at)}</p>
                        </div>
                        
                        <div className="ml-4">
                          {application.status === 'submitted' && (
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => handleApplicationStatus(application.id, 'reviewing')}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                              >
                                Review
                              </button>
                              <button
                                onClick={() => handleApplicationStatus(application.id, 'shortlisted')}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() => handleApplicationStatus(application.id, 'rejected')}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {application.status === 'shortlisted' && (
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => handleApplicationStatus(application.id, 'interviewed')}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                              >
                                Interviewed
                              </button>
                              <button
                                onClick={() => handleApplicationStatus(application.id, 'hired')}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                              >
                                Hire
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {applications.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Applications will appear here when candidates apply to your job postings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
} 