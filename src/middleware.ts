import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow all admin routes - authentication handled client-side
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
} 