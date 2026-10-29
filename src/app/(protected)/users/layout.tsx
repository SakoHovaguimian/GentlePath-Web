import type { ReactNode } from 'react';
import { getServerSession } from '@/lib/server/getServerSession';
import { canManageContent } from '@/services/auth/permissions';
import { AccessDenied } from '@/components/AccessDenied';
export default async function UsersLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession();
  return session && canManageContent(session.user.role) ? (
    children
  ) : (
    <AccessDenied />
  );
}
