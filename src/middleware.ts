import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle language paths that don't exist
  if (pathname.startsWith('/es') || pathname.startsWith('/fr') || pathname.startsWith('/de')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow all other paths to be handled by Next.js
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}