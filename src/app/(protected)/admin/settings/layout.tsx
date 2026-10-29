import type { ReactNode } from 'react';
import { getServerSession } from '@/lib/server/getServerSession';
import { canManagePlatform } from '@/services/auth/permissions';
import { AccessDenied } from '@/components/AccessDenied';
export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession();
  return session && canManagePlatform(session.user.role) ? (
    children
  ) : (
    <AccessDenied />
  );
}
