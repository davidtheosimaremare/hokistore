"use client";

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  Image, 
  Plus,
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  Star,
  ExternalLink,
  Users,
  Calendar,
  MessageSquare
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface PortfolioItem {
  id: string
  title: string
  slug: string
  description: string
  short_description: string | null
  featured_image: string | null
  client_name: string
  client_logo: string | null
  client_website: string | null
  testimonial: string | null
  testimonial_author: string | null
  testimonial_position: string | null
  category: string | null
  services_provided: string[] | null
  project_duration: string | null
  project_value: string | null
  completion_date: string | null
  is_featured: boolean
  created_at: string
}

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    loadPortfolioItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [portfolioItems, searchQuery, selectedCategory])

  const loadPortfolioItems = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading portfolio items:', error)
        return
      }

      if (data) {
        setPortfolioItems(data)
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error('Error loading portfolio items:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = portfolioItems

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    setFilteredItems(filtered)
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', itemId)

      if (error) {
        console.error('Error deleting portfolio item:', error)
        return
      }

      setPortfolioItems(portfolioItems.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Error deleting portfolio item:', error)
    }
  }

  const handleToggleFeatured = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .update({ is_featured: !currentStatus })
        .eq('id', itemId)

      if (error) {
        console.error('Error updating portfolio item:', error)
        return
      }

      setPortfolioItems(portfolioItems.map(item => 
        item.id === itemId ? { ...item, is_featured: !currentStatus } : item
      ))
    } catch (error) {
      console.error('Error updating portfolio item:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
  }

  // Calculate stats
  const featuredItems = portfolioItems.filter(item => item.is_featured).length
  const itemsWithTestimonials = portfolioItems.filter(item => item.testimonial).length
  const totalClients = new Set(portfolioItems.map(item => item.client_name)).size

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
            <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
            <p className="text-gray-600 text-sm">Manage client references and case studies</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Portfolio Item</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{portfolioItems.length}</p>
              </div>
              <Image className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-yellow-600">{featuredItems}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <p className="text-2xl font-bold text-purple-600">{totalClients}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Testimonials</p>
                <p className="text-2xl font-bold text-green-600">{itemsWithTestimonials}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-600" />
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
                  placeholder="Search portfolio items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {(searchQuery || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredItems.length} of {portfolioItems.length} portfolio items
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {item.featured_image && (
                <img 
                  src={item.featured_image} 
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                  {item.is_featured && (
                    <Star className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0 ml-2" />
                  )}
                </div>
                
                <div className="flex items-center mb-2">
                  {item.client_logo ? (
                    <img 
                      src={item.client_logo} 
                      alt={item.client_name}
                      className="w-8 h-8 object-contain mr-2"
                    />
                  ) : (
                    <Users className="w-5 h-5 text-gray-400 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-900">{item.client_name}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.short_description || item.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  {item.category && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {item.category}
                    </span>
                  )}
                  
                  {item.services_provided && item.services_provided.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.services_provided.slice(0, 2).map((service, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {service}
                        </span>
                      ))}
                      {item.services_provided.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{item.services_provided.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {item.testimonial && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-700 italic line-clamp-3">"{item.testimonial}"</p>
                    {item.testimonial_author && (
                      <p className="text-xs text-gray-500 mt-1">
                        - {item.testimonial_author}
                        {item.testimonial_position && `, ${item.testimonial_position}`}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    {item.completion_date ? formatDate(item.completion_date) : formatDate(item.created_at)}
                  </span>
                  {item.client_website && (
                    <a 
                      href={item.client_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {item.project_duration && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {item.project_duration}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleToggleFeatured(item.id, item.is_featured)}
                      className={`p-1 rounded ${item.is_featured ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                    >
                      <Star className={`w-4 h-4 ${item.is_featured ? 'fill-current' : ''}`} />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
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

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No portfolio items found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first portfolio item.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
} 