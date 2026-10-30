import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getContainer } from '@/container';
import { canManageContent } from '@/services/auth/permissions';
import { getProfileSession } from '@/services/auth/profileSession';

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await (await getContainer()).sessionService.read();
  if (!session || session.auth.expiresAt <= Date.now()) return children;

  // Redirect only after verifying the current identity, without refreshing or
  // writing cookies during rendering. Failed verification leaves auth usable.
  const user = await getProfileSession(session.auth).catch(() => null);
  if (user && session.auth.expiresAt > Date.now())
    redirect(canManageContent(user.role) ? '/admin' : '/dashboard');
  return children;
}
