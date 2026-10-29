import { z } from 'zod';
import { UserRoleSchema } from './userRole';
export const SessionUserSchema = z.object({
  id: z.string().min(1),
  externalId: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRoleSchema.default('user'),
});
export type SessionUser = z.infer<typeof SessionUserSchema>;
