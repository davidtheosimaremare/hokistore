"use client";

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'
import { 
  Package, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw,
  Download,
  Zap,
  Globe,
  Image as ImageIcon,
  FileText,
  BarChart3
} from 'lucide-react'

interface SupabaseProduct {
  id: number
  name: string
  description?: string
  short_description?: string
  price: number
  original_price?: number
  stock_quantity: number
  unit: string
  category: string
  accurate_id?: string
  accurate_code?: string
  model?: string
  brand?: string
  sku?: string
  status: 'active' | 'inactive' | 'draft'
  is_published: boolean
  is_available_online: boolean
  display_order?: number
  
  // SEO fields
  seo_title?: string
  seo_description?: string
  seo_keywords?: string
  
  // Image fields
  thumbnail?: string
  admin_thumbnail?: string
  admin_slide_images: string[]
  
  // Metadata
  specifications?: any
  
  // Timestamps
  created_at: string
  updated_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<SupabaseProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<SupabaseProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPublishStatus, setSelectedPublishStatus] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, selectedCategory, selectedStatus, selectedPublishStatus])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📦 [ADMIN-PRODUCTS] Loading products from Supabase...')
      
      // Load all products from Supabase
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (productsError) {
        throw new Error(productsError.message)
      }

      console.log(`✅ [ADMIN-PRODUCTS] Loaded ${productsData?.length || 0} products from Supabase`)

      setProducts(productsData || [])
      setTotalProducts(productsData?.length || 0)
      
      // Extract unique categories
      const uniqueCategories = [...new Set(
        (productsData || [])
          .map(p => p.category)
          .filter(Boolean)
          .filter((name): name is string => typeof name === 'string')
      )]
      setCategories(uniqueCategories)
      
    } catch (error: any) {
      console.error('❌ [ADMIN-PRODUCTS] Error loading products:', error)
      setError(error.message || 'Failed to load products from database')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    // Search filter - only name and category (case insensitive)
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Status filter
    if (selectedStatus === 'active') {
      filtered = filtered.filter(product => product.status === 'active')
    } else if (selectedStatus === 'inactive') {
      filtered = filtered.filter(product => product.status === 'inactive')
    } else if (selectedStatus === 'draft') {
      filtered = filtered.filter(product => product.status === 'draft')
    } else if (selectedStatus === 'out_of_stock') {
      filtered = filtered.filter(product => product.stock_quantity === 0)
    } else if (selectedStatus === 'low_stock') {
      filtered = filtered.filter(product => product.stock_quantity > 0 && product.stock_quantity <= 5)
    }

    // Publication status filter
    if (selectedPublishStatus === 'published') {
      filtered = filtered.filter(product => product.is_published)
    } else if (selectedPublishStatus === 'unpublished') {
      filtered = filtered.filter(product => !product.is_published)
    } else if (selectedPublishStatus === 'online') {
      filtered = filtered.filter(product => product.is_available_online)
    } else if (selectedPublishStatus === 'offline') {
      filtered = filtered.filter(product => !product.is_available_online)
    }

    setFilteredProducts(filtered)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (product: SupabaseProduct) => {
    if (product.status === 'inactive') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          <X className="w-3 h-3 mr-1" />
          Inactive
        </span>
      )
    } else if (product.status === 'draft') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          <FileText className="w-3 h-3 mr-1" />
          Draft
        </span>
      )
    } else if (product.stock_quantity === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Out of Stock
        </span>
      )
    } else if (product.stock_quantity <= 5) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Low Stock
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          In Stock
        </span>
      )
    }
  }

  const getPublishStatusBadge = (product: SupabaseProduct) => {
    if (!product.is_published) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          <X className="w-3 h-3 mr-1" />
          Unpublished
        </span>
      )
    } else if (!product.is_available_online) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Offline
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          <Globe className="w-3 h-3 mr-1" />
          Published
        </span>
      )
    }
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'text-red-600' }
    if (quantity <= 5) return { label: 'Low Stock', color: 'text-yellow-600' }
    return { label: 'In Stock', color: 'text-green-600' }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedStatus('')
    setSelectedPublishStatus('')
  }

  const togglePublishStatus = async (product: SupabaseProduct) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_published: !product.is_published })
        .eq('id', product.id)

      if (error) throw error

      // Reload products to reflect changes
      loadProducts()
    } catch (error: any) {
      console.error('Error updating publish status:', error)
      alert('Failed to update publish status')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Loading products from database...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-64">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={loadProducts}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
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
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 text-sm">Manage your product catalog from Supabase database</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={loadProducts}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.is_published).length}
                </p>
              </div>
              <Globe className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {products.filter(p => p.stock_quantity <= 5 && p.stock_quantity > 0).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stock_quantity === 0).length}
                </p>
              </div>
              <X className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by product name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Category Filter */}
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

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="low_stock">Low Stock</option>
            </select>

            {/* Publish Status Filter */}
            <select
              value={selectedPublishStatus}
              onChange={(e) => setSelectedPublishStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Publish Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
              <option value="online">Available Online</option>
              <option value="offline">Not Available Online</option>
            </select>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory || selectedStatus || selectedPublishStatus) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredProducts.length} of {totalProducts} products
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity)
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {product.admin_thumbnail ? (
                              <img 
                                src={product.admin_thumbnail} 
                                alt={product.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku || product.accurate_code || 'N/A'}
                            </div>
                            {product.brand && (
                              <div className="text-xs text-blue-600">
                                Brand: {product.brand}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{product.category || 'Uncategorized'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </div>
                        {product.original_price && product.original_price > product.price && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatCurrency(product.original_price)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock_quantity} {product.unit}</div>
                        <div className={`text-xs ${stockStatus.color}`}>{stockStatus.label}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePublishStatus(product)}
                          className="cursor-pointer"
                        >
                          {getPublishStatusBadge(product)}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(product.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-900 transition-colors" title="Manage Images">
                            <ImageIcon className="w-4 h-4" />
                          </button>
                          <button className="text-orange-600 hover:text-orange-900 transition-colors" title="SEO">
                            <BarChart3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {totalProducts === 0 
                    ? "No products available in database."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 