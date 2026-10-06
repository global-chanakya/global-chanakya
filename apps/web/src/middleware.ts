import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { MemoryRateLimiter } from '@/lib/rate-limit';

const { auth } = NextAuth(authConfig);

// Allowed roles for the /admin dashboard area
const ADMIN_ROLES = ["super_admin", "admin", "editor", "analyst"];

export default auth(async (req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // 0. API Rate Limiting & CSRF
  if (pathname.startsWith('/api/')) {
    // CSRF Check for mutating requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const origin = req.headers.get('origin');
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin || 'http://localhost:3000';
      if (origin && !origin.startsWith(siteUrl)) {
        return new NextResponse('Forbidden - CSRF origin mismatch', { status: 403 });
      }
    }

    // Best-effort local Rate Limiting (replaces global Upstash)
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    // Conservative limit: 300 requests per 60 seconds per IP
    const { success } = await MemoryRateLimiter.checkLimit(ip, 'global_api', 300, 60000);
    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '300',
        },
      });
    }
  }

  // 1. Admin Route Protection
  if (
    pathname === '/admin' || 
    pathname.startsWith('/admin/') || 
    pathname === '/gc-control-9x7k' || 
    pathname.startsWith('/gc-control-9x7k/')
  ) {
    if (!session?.user) {
      const url = new URL('/api/auth/signin', req.url);
      url.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const role = session.user.role;
    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/404', req.url));
    }
  }

  // 2. Session Fingerprinting
  const response = NextResponse.next();
  if (!req.cookies.has('gc_fingerprint')) {
    const fingerprint = crypto.randomUUID();
    response.cookies.set('gc_fingerprint', fingerprint, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return response;
});

export const config = {
  matcher: [
    '/admin/:path*',
    '/gc-control-9x7k/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/admin/:path*',
    '/api/profile/:path*',
    '/api/auth/:path*'
  ],
};
