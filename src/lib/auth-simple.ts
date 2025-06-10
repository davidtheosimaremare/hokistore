import { supabaseAdmin } from './supabase'
import bcrypt from 'bcryptjs'

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'super_admin' | 'admin' | 'staff'
  is_active: boolean
  last_login?: string
}

// Simple login function
export async function loginAdmin(email: string, password: string): Promise<{
  success: boolean
  user?: AdminUser
  error?: string
}> {
  try {
    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return { success: false, error: 'Email atau password salah' }
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return { success: false, error: 'Email atau password salah' }
    }

    // Update last login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Return user without password
    const { password_hash, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword }

  } catch (error) {
    return { success: false, error: 'Terjadi kesalahan sistem' }
  }
}

// Check if authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('admin_token')
}

// Get current user
export function getCurrentUser(): AdminUser | null {
  if (typeof window === 'undefined') return null
  
  const userData = localStorage.getItem('admin_user')
  if (!userData) return null
  
  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
}

// Set session
export function setSession(user: AdminUser): void {
  localStorage.setItem('admin_token', 'authenticated')
  localStorage.setItem('admin_user', JSON.stringify(user))
}

// Clear session
export function clearSession(): void {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
} 