'use client';

import { strings } from '@/strings';
import type { Route } from 'next';
import { AppSessionSchema } from '@/models/appSession';

const allowedRedirectPrefixes = [
  '/dashboard',
  '/users',
  '/feature-requests',
  '/settings',
  '/profile',
  '/experience',
  '/dev-settings',
  '/chat',
  '/journal',
  '/family',
  '/resources',
  '/milestones',
  '/saved',
  '/admin',
  '/superadmin',
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
  return AppSessionSchema.parse(await response.json());
}

export async function enableDemoMode() {
  const response = await fetch('/api/dev-settings/demo', {
    method: 'POST',
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error(strings.errors.unavailable);
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
