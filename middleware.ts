import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if the request is for admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Skip login page
    if (req.nextUrl.pathname === '/admin/login') {
      return res
    }

    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session, redirect to login
    if (!session) {
      const redirectUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Check user role if accessing admin routes
    if (session.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      // If no role found or insufficient permissions
      if (!profile || !['super_admin', 'admin', 'editor'].includes(profile.role)) {
        const redirectUrl = new URL('/admin/login?error=insufficient_permissions', req.url)
        return NextResponse.redirect(redirectUrl)
      }

      // Set user data in headers for use in admin components
      res.headers.set('x-user-id', session.user.id)
      res.headers.set('x-user-role', profile.role)
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
} 