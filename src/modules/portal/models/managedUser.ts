import { z } from 'zod';
import { UserRoleSchema } from '@/models/userRole';
import { ManagedUserRoleSchema } from './managedUserRole';

export const ManagedUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: ManagedUserRoleSchema,
  createdAt: z.string().datetime(),
  disabled: z.boolean(),
});
export const ManagedUserInputSchema = z
  .object({ role: UserRoleSchema.optional(), disabled: z.boolean().optional() })
  .refine((value) => value.role !== undefined || value.disabled !== undefined);
export type ManagedUser = z.infer<typeof ManagedUserSchema>;
export type ManagedUserInput = z.infer<typeof ManagedUserInputSchema>;
