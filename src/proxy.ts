import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';

  // Get hostname without port (useful for localhost testing)
  const cleanHost = host.split(':')[0];

  // Check if request is coming from the YBM domain
  if (
    cleanHost === 'business-bootcamp-ybm.uz' || 
    cleanHost === 'www.business-bootcamp-ybm.uz'
  ) {
    // Rewrite root path "/" to "/bootcamp-x-ybm"
    if (url.pathname === '/') {
      url.pathname = '/bootcamp-x-ybm';
      return NextResponse.rewrite(url);
    }

    // Rewrite "/success" to "/bootcamp-x-ybm/success"
    if (url.pathname === '/success') {
      url.pathname = '/bootcamp-x-ybm/success';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

// Ensure the proxy runs on all paths except static assets and API
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - icon.png (favicon / icon files)
     * - YBM logo-03.png (logo images)
     */
    '/((?!api|_next/static|_next/image|icon.png|YBM logo-03.png).*)',
  ],
};
