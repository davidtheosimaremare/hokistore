"use client";

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
  Database,
  Globe,
  FileText,
  Briefcase,
  Image,
  UserCheck
} from 'lucide-react'
import { getCurrentUser, clearSession, isAuthenticated } from '@/lib/auth-simple'

interface AdminLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { 
    name: 'Dashboard', 
    href: '/admin/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Products', 
    href: '/admin/products', 
    icon: Package 
  },
  { 
    name: 'Orders', 
    href: '/admin/orders', 
    icon: ShoppingCart 
  },
  { 
    name: 'Customers', 
    href: '/admin/customers', 
    icon: Users 
  },
  { 
    name: 'Blog', 
    href: '/admin/blog', 
    icon: FileText 
  },
  { 
    name: 'Projects', 
    href: '/admin/projects', 
    icon: Briefcase 
  },
  { 
    name: 'Portfolio', 
    href: '/admin/portfolio', 
    icon: Image 
  },
  { 
    name: 'Careers', 
    href: '/admin/careers', 
    icon: UserCheck 
  },
  { 
    name: 'Analytics', 
    href: '/admin/analytics', 
    icon: BarChart3 
  },
  { 
    name: 'Sync Accurate', 
    href: '/admin/sync', 
    icon: Database 
  },
  { 
    name: 'Settings', 
    href: '/admin/settings', 
    icon: Settings 
  }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/admin/login')
      return
    }

    // Get user data
    const userData = getCurrentUser()
    if (userData) {
      setUser(userData)
    } else {
      router.push('/admin/login')
      return
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    clearSession()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 lg:static lg:flex-shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full w-64">
          {/* Logo & Close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Hokiindo</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.full_name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                  {user.role || 'admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-red-100 text-red-700 border-l-4 border-red-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Bottom section */}
          <div className="p-3 border-t border-gray-200">
            <Link
              href="/"
              target="_blank"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 mb-1"
            >
              <Globe className="w-5 h-5" />
              <span>View Website</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Hokiindo Admin
            </h1>
            <div className="w-9"></div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 