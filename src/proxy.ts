import { NextRequest, NextResponse } from 'next/server';
import {
  decodeSession,
  sessionCookieName,
} from '@/services/session/sessionCodec';
import { getEffectiveRuntime } from '@/services/demo/demoRuntime';
import {
  canManageContent,
  canManagePlatform,
} from '@/services/auth/permissions';
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(sessionCookieName)?.value;
  const runtime = await getEffectiveRuntime(request.cookies);
  const session = token ? await decodeSession(token, runtime.demoMode) : null;
  const authRoute = ['/login', '/signup'].includes(request.nextUrl.pathname);
  if (!session && !authRoute) {
    const url = new URL('/login', request.url);
    url.searchParams.set(
      'redirectTo',
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(url);
  }
  if (
    session &&
    (((request.nextUrl.pathname.startsWith('/admin') ||
      request.nextUrl.pathname.startsWith('/users')) &&
      !canManageContent(session.user.role)) ||
      (request.nextUrl.pathname.startsWith('/superadmin') &&
        !canManagePlatform(session.user.role)))
  )
    return NextResponse.redirect(new URL('/access-denied', request.url));
  if (
    session &&
    request.nextUrl.pathname.startsWith('/dev-settings') &&
    !runtime.devSettingsEnabled
  )
    return NextResponse.redirect(new URL('/access-denied', request.url));
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
    '/journal/:path*',
    '/family/:path*',
    '/resources/:path*',
    '/milestones/:path*',
    '/saved/:path*',
    '/admin/:path*',
    '/superadmin/:path*',
    '/access-denied',
  ],
};
