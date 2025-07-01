import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-middleware';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/verify-email'];

// Define admin-only routes
const adminRoutes = ['/admin-predictions', '/admin-feedback', '/questions', '/grant-points', '/staff', '/users'];

// Define staff-only routes  
const staffRoutes = ['/staff-predictions', '/staff-questions', '/staff-users'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const token = request.cookies.get('auth-token')?.value;

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    // Invalid token, clear cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }

  // For admin and staff routes, we need to check user role
  // Note: This is a basic check. In a real app, you'd want to fetch user role from DB
  if (adminRoutes.some(route => pathname.startsWith(route)) || 
      staffRoutes.some(route => pathname.startsWith(route))) {
    // Here you would typically fetch the user from the database to check their role
    // For now, we'll let the server-side component handle this check
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except static files, API routes, and Next.js internals
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 