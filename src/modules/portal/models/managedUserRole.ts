import { z } from 'zod';

export const ManagedUserRoleSchema = z.enum([
  'user',
  'admin',
  'superadmin',
  'owner',
  'manager',
  'employee',
  'receptionist',
]);
export type ManagedUserRole = z.infer<typeof ManagedUserRoleSchema>;
