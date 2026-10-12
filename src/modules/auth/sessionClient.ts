'use client';

import { strings } from '@/strings';
import type { Route } from 'next';

const allowedRedirectPrefixes = [
  '/dashboard',
  '/users',
  '/feature-requests',
  '/settings',
  '/profile',
  '/experience',
  '/dev-settings',
  '/chat',
] as const;

export async function createSession(body: Record<string, unknown>) {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      payload?.message ?? strings.ui.sessionClient.unableToEstablishSession,
    );
  }
}

export function resolveAuthRedirect(redirectTo?: string): Route {
  if (
    redirectTo &&
    !redirectTo.includes('\\') &&
    allowedRedirectPrefixes.some(
      (prefix) =>
        redirectTo === prefix ||
        redirectTo.startsWith(`${prefix}/`) ||
        redirectTo.startsWith(`${prefix}?`),
    )
  ) {
    return redirectTo as Route;
  }

  return '/dashboard';
}
