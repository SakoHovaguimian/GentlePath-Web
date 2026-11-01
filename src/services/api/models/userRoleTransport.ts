import { z } from 'zod';
import { UserRoleSchema } from '@/models/userRole';

export const UserRoleTransportSchema = z.union([
  UserRoleSchema,
  z.enum([
    'USER',
    'ADMIN',
    'SUPER_ADMIN',
    'OWNER',
    'MANAGER',
    'EMPLOYEE',
    'RECEPTIONIST',
  ]),
]);
export type UserRoleTransport = z.infer<typeof UserRoleTransportSchema>;
