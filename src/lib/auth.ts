import { supabase, supabaseAdmin } from './supabase'
import bcrypt from 'bcryptjs'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AdminAuthUser {
  id: string
  email: string
  full_name: string
  role: 'super_admin' | 'admin' | 'staff'
  is_active: boolean
  last_login?: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  console.log('🔐 bcrypt.compare details:')
  console.log('  - Input password length:', password.length)
  console.log('  - Hash format check:', hashedPassword.startsWith('$2b$') ? 'Valid bcrypt format' : 'Invalid format')
  console.log('  - Hash length:', hashedPassword.length)
  
  try {
    const result = await bcrypt.compare(password, hashedPassword)
    console.log('  - bcrypt.compare result:', result)
    return result
  } catch (error) {
    console.error('  - bcrypt.compare error:', error)
    return false
  }
}

// Admin login function
export async function loginAdmin(credentials: LoginCredentials): Promise<{
  success: boolean
  user?: AdminAuthUser
  error?: string
}> {
  console.log('🔍 Starting login process for:', credentials.email)
  
  try {
    // Get admin user from database
    console.log('📡 Fetching user from database...')
    const { data: adminUser, error: fetchError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', credentials.email)
      .eq('is_active', true)
      .single()

    console.log('📊 Database fetch result:', {
      hasUser: !!adminUser,
      hasError: !!fetchError,
      error: fetchError,
      userEmail: adminUser?.email,
      userRole: adminUser?.role,
      isActive: adminUser?.is_active
    })

    if (fetchError || !adminUser) {
      console.log('❌ User not found or database error')
      return {
        success: false,
        error: 'Email atau password tidak valid'
      }
    }

    // Debug password verification
    console.log('🔐 Starting password verification...')
    console.log('📝 Input password:', credentials.password)
    console.log('📝 Stored hash:', adminUser.password_hash)
    console.log('🔧 Using bcrypt.compare...')
    
    const isValidPassword = await verifyPassword(credentials.password, adminUser.password_hash)
    
    console.log('✅ Password verification result:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('❌ Password verification failed')
      return {
        success: false,
        error: 'Email atau password tidak valid'
      }
    }

    console.log('🎉 Password verified successfully!')

    // Update last login
    console.log('📅 Updating last login timestamp...')
    const updateResult = await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id)
    
    console.log('📅 Last login update result:', updateResult)

    // Return user data (without password)
    const { password_hash, ...userWithoutPassword } = adminUser
    
    console.log('👤 Returning user data:', userWithoutPassword)
    
    return {
      success: true,
      user: userWithoutPassword as AdminAuthUser
    }

  } catch (error) {
    console.error('💥 Login exception:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan saat login: ' + (error instanceof Error ? error.message : 'Unknown error')
    }
  }
}

// Check if user is authenticated (for middleware)
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  
  const adminSession = localStorage.getItem('admin_session')
  if (!adminSession) return false

  try {
    const session = JSON.parse(adminSession)
    const now = new Date().getTime()
    
    // Check if session is expired (24 hours)
    if (now > session.expiresAt) {
      localStorage.removeItem('admin_session')
      return false
    }

    return true
  } catch {
    localStorage.removeItem('admin_session')
    return false
  }
}

// Get current admin user
export function getCurrentAdmin(): AdminAuthUser | null {
  if (typeof window === 'undefined') return null
  
  const adminSession = localStorage.getItem('admin_session')
  if (!adminSession) return null

  try {
    const session = JSON.parse(adminSession)
    const now = new Date().getTime()
    
    if (now > session.expiresAt) {
      localStorage.removeItem('admin_session')
      return null
    }

    return session.user
  } catch {
    localStorage.removeItem('admin_session')
    return null
  }
}

// Set admin session
export function setAdminSession(user: AdminAuthUser): void {
  console.log('💾 Setting admin session for user:', user);
  
  const session = {
    user,
    expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
  }
  
  console.log('💾 Session object created:', session);
  
  try {
    localStorage.setItem('admin_session', JSON.stringify(session));
    console.log('✅ Session stored successfully in localStorage');
    
    // Also set a simple cookie for middleware
    if (typeof document !== 'undefined') {
      document.cookie = `adminToken=authenticated; path=/; max-age=${24 * 60 * 60}`;
      console.log('🍪 Cookie set for middleware compatibility');
    }
  } catch (error) {
    console.error('❌ Error storing session:', error);
  }
}

// Logout admin
export function logoutAdmin(): void {
  localStorage.removeItem('admin_session')
  
  // Also clear cookie
  if (typeof document !== 'undefined') {
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('🍪 Cookie cleared');
  }
}

// Create new admin user (for setup)
export async function createAdminUser(userData: {
  email: string
  password: string
  full_name: string
  role: 'super_admin' | 'admin' | 'staff'
}): Promise<{ success: boolean; error?: string }> {
  try {
    const hashedPassword = await hashPassword(userData.password)
    
    const { error } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email: userData.email,
        password_hash: hashedPassword,
        full_name: userData.full_name,
        role: userData.role
      })

    if (error) {
      if (error.code === '23505') { // Unique violation
        return {
          success: false,
          error: 'Email sudah terdaftar'
        }
      }
      return {
        success: false,
        error: 'Gagal membuat akun admin'
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Create admin error:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan saat membuat akun'
    }
  }
} 