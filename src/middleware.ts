import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/rss.xml')) {
    return NextResponse.rewrite(new URL('/api/rss.xml', request.url));
  }

  // Protect dashboard pages (except login)
  if (
    request.nextUrl.pathname.startsWith('/dashboard') &&
    !request.nextUrl.pathname.startsWith('/dashboard/login')
  ) {
    const token = request.cookies.get('dashboard_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/dashboard/login', request.url));
    }

    // Basic token structure check (full verification happens in API routes)
    const parts = token.split('.');
    if (parts.length !== 2) {
      return NextResponse.redirect(new URL('/dashboard/login', request.url));
    }

    try {
      const payload = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      if (payload.exp < Date.now()) {
        const response = NextResponse.redirect(new URL('/dashboard/login', request.url));
        response.cookies.delete('dashboard_token');
        return response;
      }
    } catch {
      return NextResponse.redirect(new URL('/dashboard/login', request.url));
    }
  }
}
