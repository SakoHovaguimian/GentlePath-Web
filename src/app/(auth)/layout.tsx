import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server/getServerSession';
import { canManageContent } from '@/services/auth/permissions';

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession();
  if (session)
    redirect(canManageContent(session.user.role) ? '/admin' : '/dashboard');
  return children;
}
