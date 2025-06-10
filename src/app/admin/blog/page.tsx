"use client";

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  FileText, 
  Plus,
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  MessageSquare,
  Calendar,
  User,
  Tag,
  BarChart3
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  status: 'draft' | 'published' | 'archived'
  author_id: string | null
  tags: string[] | null
  published_at: string | null
  created_at: string
  updated_at: string
}

interface BlogComment {
  id: string
  post_id: string
  name: string
  email: string
  content: string
  status: 'pending' | 'approved' | 'spam' | 'rejected'
  created_at: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [comments, setComments] = useState<BlogComment[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')

  useEffect(() => {
    loadBlogData()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery, selectedStatus])

  const loadBlogData = async () => {
    try {
      setLoading(true)

      // Load blog posts
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (postsError) {
        console.error('Error loading blog posts:', postsError)
      } else if (postsData) {
        setPosts(postsData)
      }

      // Load comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('blog_comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (commentsError) {
        console.error('Error loading comments:', commentsError)
      } else if (commentsData) {
        setComments(commentsData)
      }

    } catch (error) {
      console.error('Error loading blog data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = posts

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedStatus) {
      filtered = filtered.filter(post => post.status === selectedStatus)
    }

    setFilteredPosts(filtered)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId)

      if (error) {
        console.error('Error deleting post:', error)
        return
      }

      setPosts(posts.filter(p => p.id !== postId))
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleCommentStatus = async (commentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({ status: newStatus })
        .eq('id', commentId)

      if (error) {
        console.error('Error updating comment status:', error)
        return
      }

      setComments(comments.map(c => 
        c.id === commentId ? { ...c, status: newStatus as any } : c
      ))
    } catch (error) {
      console.error('Error updating comment status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800', label: 'Published' },
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Archived' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getCommentStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      spam: { color: 'bg-red-100 text-red-800', label: 'Spam' },
      rejected: { color: 'bg-gray-100 text-gray-800', label: 'Rejected' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
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
  const publishedPosts = posts.filter(p => p.status === 'published').length
  const draftPosts = posts.filter(p => p.status === 'draft').length
  const pendingComments = comments.filter(c => c.status === 'pending').length

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
            <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-gray-600 text-sm">Manage blog posts and comments</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Post</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">{publishedPosts}</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600">{draftPosts}</p>
              </div>
              <Edit className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Comments</p>
                <p className="text-2xl font-bold text-orange-600">{pendingComments}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Posts ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'comments'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Comments ({comments.length})
              </button>
            </nav>
          </div>

          {activeTab === 'posts' && (
            <div className="p-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search posts..."
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
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
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

              {/* Posts Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Published
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {post.excerpt || 'No excerpt available'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(post.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {post.published_at ? formatDate(post.published_at) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(post.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new blog post.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="p-4">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{comment.name}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{comment.email}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="text-gray-900 mb-2">{comment.content}</p>
                        <div className="flex items-center space-x-2">
                          {getCommentStatusBadge(comment.status)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {comment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleCommentStatus(comment.id, 'approved')}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleCommentStatus(comment.id, 'spam')}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                            >
                              Spam
                            </button>
                          </>
                        )}
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comments will appear here when visitors leave them on your blog posts.
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