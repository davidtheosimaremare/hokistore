import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    // Get the admin user from database
    const { data: adminUser, error: fetchError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@hokiindo.com')
      .single()

    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: 'Database fetch error',
        details: fetchError
      })
    }

    if (!adminUser) {
      return NextResponse.json({
        success: false,
        error: 'User not found in database'
      })
    }

    // Test password verification
    const testPassword = 'admin123'
    const storedHash = adminUser.password_hash
    
    // Try to verify with bcrypt
    const isValidPassword = await bcrypt.compare(testPassword, storedHash)
    
    // Generate a new hash for comparison
    const newHash = await bcrypt.hash(testPassword, 10)
    const newHashVerify = await bcrypt.compare(testPassword, newHash)

    return NextResponse.json({
      success: true,
      debug: {
        userFound: !!adminUser,
        email: adminUser.email,
        storedHash: storedHash,
        testPassword: testPassword,
        bcryptVerifyResult: isValidPassword,
        newHashGenerated: newHash,
        newHashVerifyWorks: newHashVerify,
        userData: {
          id: adminUser.id,
          email: adminUser.email,
          full_name: adminUser.full_name,
          role: adminUser.role,
          is_active: adminUser.is_active
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Simulate the exact login flow
    const { data: adminUser, error: fetchError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    console.log('Fetch result:', { adminUser, fetchError })

    if (fetchError || !adminUser) {
      return NextResponse.json({
        success: false,
        step: 'database_fetch',
        error: 'Email atau password tidak valid',
        details: fetchError
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash)
    console.log('Password verification:', { password, hash: adminUser.password_hash, isValid: isValidPassword })
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        step: 'password_verification',
        error: 'Email atau password tidak valid',
        debug: {
          inputPassword: password,
          storedHash: adminUser.password_hash,
          bcryptResult: isValidPassword
        }
      })
    }

    // Return success
    const { password_hash, ...userWithoutPassword } = adminUser
    
    return NextResponse.json({
      success: true,
      step: 'login_success',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login debug error:', error)
    return NextResponse.json({
      success: false,
      step: 'exception',
      error: 'Terjadi kesalahan saat login',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 