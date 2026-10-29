import type { UserRole } from '@/models/userRole';

export type UserRoleTransport =
  | UserRole
  | 'USER'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'MANAGER'
  | 'EMPLOYEE'
  | 'RECEPTIONIST';
