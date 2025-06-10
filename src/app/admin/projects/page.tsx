"use client";

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  Briefcase, 
  Plus,
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  Calendar,
  Users,
  ExternalLink,
  Github,
  Star,
  Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Project {
  id: string
  title: string
  slug: string
  description: string
  short_description: string | null
  featured_image: string | null
  client_name: string | null
  project_type: string | null
  industry: string | null
  technologies: string[] | null
  project_url: string | null
  github_url: string | null
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  start_date: string | null
  end_date: string | null
  budget_range: string | null
  team_size: number | null
  is_featured: boolean
  created_at: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchQuery, selectedStatus])

  const loadProjects = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading projects:', error)
        return
      }

      if (data) {
        setProjects(data)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedStatus) {
      filtered = filtered.filter(project => project.status === selectedStatus)
    }

    setFilteredProjects(filtered)
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Error deleting project:', error)
        return
      }

      setProjects(projects.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleToggleFeatured = async (projectId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_featured: !currentStatus })
        .eq('id', projectId)

      if (error) {
        console.error('Error updating project:', error)
        return
      }

      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, is_featured: !currentStatus } : p
      ))
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-blue-100 text-blue-800', label: 'Active' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      on_hold: { color: 'bg-yellow-100 text-yellow-800', label: 'On Hold' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedStatus('')
  }

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === 'active').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const featuredProjects = projects.filter(p => p.is_featured).length

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
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 text-sm">Manage your project portfolio</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">{activeProjects}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedProjects}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-yellow-600">{featuredProjects}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {(searchQuery || selectedStatus) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {project.featured_image && (
                <img 
                  src={project.featured_image} 
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{project.title}</h3>
                  {project.is_featured && (
                    <Star className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0 ml-2" />
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {project.short_description || project.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  {project.client_name && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      {project.client_name}
                    </div>
                  )}
                  
                  {project.project_type && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {project.project_type}
                    </div>
                  )}
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.slice(0, 3).map((tech, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{project.technologies.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  {getStatusBadge(project.status)}
                  <span className="text-sm text-gray-500">
                    {formatDate(project.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {project.project_url && (
                      <a 
                        href={project.project_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {project.github_url && (
                      <a 
                        href={project.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleToggleFeatured(project.id, project.is_featured)}
                      className={`p-1 rounded ${project.is_featured ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                    >
                      <Star className={`w-4 h-4 ${project.is_featured ? 'fill-current' : ''}`} />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first project.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
} 