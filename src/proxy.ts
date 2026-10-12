import { NextRequest, NextResponse } from 'next/server';
import {
  decodeSession,
  sessionCookieName,
} from '@/services/session/sessionCodec';
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(sessionCookieName)?.value;
  const session = token ? await decodeSession(token) : null;
  const authRoute = ['/login', '/signup'].includes(request.nextUrl.pathname);
  if (!session && !authRoute) {
    const url = new URL('/login', request.url);
    url.searchParams.set(
      'redirectTo',
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(url);
  }
  if (session && authRoute)
    return NextResponse.redirect(new URL('/dashboard', request.url));
  return NextResponse.next();
}
export const config = {
  matcher: [
    '/login',
    '/signup',
    '/dashboard/:path*',
    '/users/:path*',
    '/feature-requests/:path*',
    '/settings/:path*',
    '/dev-settings/:path*',
    '/profile/:path*',
    '/experience/:path*',
    '/chat/:path*',
  ],
};
