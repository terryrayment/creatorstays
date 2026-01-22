import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Short domain for tracking links
const SHORT_DOMAIN = 'crtrstys.com'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  
  // Check if this is the short domain
  const isShortDomain = host.includes(SHORT_DOMAIN) || host.includes('localhost:3001')
  
  if (isShortDomain) {
    // Root path - show mysterious landing
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/shortlink', request.url))
    }
    
    // Gone page
    if (pathname === '/gone') {
      return NextResponse.rewrite(new URL('/shortlink/gone', request.url))
    }
    
    // Token path - rewrite to shortlink handler
    // Match any path that looks like a token (alphanumeric, 6-20 chars)
    const tokenMatch = pathname.match(/^\/([a-zA-Z0-9]{6,20})$/)
    if (tokenMatch) {
      return NextResponse.rewrite(new URL(`/shortlink/${tokenMatch[1]}`, request.url))
    }
    
    // Any other path on short domain - show gone page
    return NextResponse.rewrite(new URL('/shortlink/gone', request.url))
  }
  
  // Main domain - continue normally
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|images|manifest.json).*)',
  ],
}
