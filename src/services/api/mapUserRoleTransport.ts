import type { UserRole } from '@/models/userRole';
import type { UserRoleTransport } from './models/userRoleTransport';

export function mapUserRoleTransport(
  role: UserRoleTransport | undefined,
): UserRole {
  if (role === 'ADMIN' || role === 'admin') return 'admin';
  if (role === 'SUPER_ADMIN' || role === 'superadmin') return 'superadmin';
  // Unrelated template roles receive ordinary family access.
  return 'user';
}
