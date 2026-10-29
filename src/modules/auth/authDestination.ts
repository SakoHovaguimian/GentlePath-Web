import type { Route } from 'next';
import type { UserRole } from '@/models/userRole';
import { canManageContent } from '@/services/auth/permissions';
import { resolveAuthRedirect } from './sessionClient';

export function authDestination(role: UserRole, redirectTo?: string): Route {
  const resolved = resolveAuthRedirect(redirectTo);
  if (redirectTo && resolved === redirectTo) return resolved;
  return canManageContent(role) ? '/admin' : '/dashboard';
}
