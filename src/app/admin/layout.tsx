'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  Briefcase, 
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell
} from 'lucide-react'
import { Button, Avatar, Badge, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react'
import { Toaster } from 'react-hot-toast'

interface User {
  id: string
  email: string
  name?: string
  role: string
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        router.push('/admin/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        // If profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email,
            role: 'customer'
          })
        
        if (insertError) {
          console.error('Error creating profile:', insertError)
          router.push('/admin/login')
          return
        }
      }

      setUser({
        id: session.user.id,
        email: session.user.email || '',
        name: profile?.name,
        role: profile?.role || 'editor'
      })
      
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/admin/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const menuItems = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: LayoutDashboard,
      roles: ['super_admin', 'admin', 'editor']
    },
    { 
      name: 'Produk', 
      href: '/admin/products', 
      icon: Package,
      roles: ['super_admin', 'admin', 'editor']
    },
    { 
      name: 'Transaksi', 
      href: '/admin/orders', 
      icon: ShoppingCart,
      roles: ['super_admin', 'admin']
    },
    { 
      name: 'Pengguna', 
      href: '/admin/users', 
      icon: Users,
      roles: ['super_admin']
    },
    { 
      name: 'Blog', 
      href: '/admin/blog', 
      icon: FileText,
      roles: ['super_admin', 'admin', 'editor']
    },
    { 
      name: 'Karir', 
      href: '/admin/careers', 
      icon: Briefcase,
      roles: ['super_admin', 'admin', 'editor']
    },
    { 
      name: 'Proyek', 
      href: '/admin/projects', 
      icon: FolderOpen,
      roles: ['super_admin', 'admin', 'editor']
    },
    { 
      name: 'Pengaturan', 
      href: '/admin/settings', 
      icon: Settings,
      roles: ['super_admin', 'admin']
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-admin-primary"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white dark:bg-gray-800 shadow-lg flex flex-col`}>
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-admin-primary rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-800 dark:text-white">HokiAdmin</span>
              </div>
            )}
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems
              .filter(item => item.roles.includes(user?.role || 'editor'))
              .map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "solid" : "ghost"}
                    color={isActive ? "primary" : "default"}
                    className={`w-full justify-start ${sidebarOpen ? 'px-4' : 'px-2'}`}
                    startContent={<Icon className="w-5 h-5" />}
                    onClick={() => router.push(item.href)}
                  >
                    {sidebarOpen && item.name}
                  </Button>
                )
              })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  {menuItems.find(item => pathname.startsWith(item.href))?.name || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selamat datang kembali, {user?.name || user?.email}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                {/* Notifications */}
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                >
                  <Badge content="5" color="danger" size="sm">
                    <Bell className="w-4 h-4" />
                  </Badge>
                </Button>

                {/* User Menu */}
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Avatar
                      size="sm"
                      name={user?.name || user?.email}
                      className="cursor-pointer"
                    />
                  </DropdownTrigger>
                  <DropdownMenu aria-label="User menu">
                    <DropdownItem key="profile" className="h-14 gap-2">
                      <div className="flex flex-col">
                        <p className="font-medium">{user?.name || user?.email}</p>
                        <p className="text-sm capitalize text-gray-500">{user?.role?.replace('_', ' ')}</p>
                      </div>
                    </DropdownItem>
                    <DropdownItem key="settings" startContent={<Settings className="w-4 h-4" />}>
                      Pengaturan
                    </DropdownItem>
                    <DropdownItem 
                      key="logout" 
                      color="danger"
                      startContent={<LogOut className="w-4 h-4" />}
                      onClick={handleLogout}
                    >
                      Keluar
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </div>
  )
} 