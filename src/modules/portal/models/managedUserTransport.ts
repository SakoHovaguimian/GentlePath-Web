import { z } from 'zod';

export const ManagedUserTransportSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  role: z.enum([
    'USER',
    'ADMIN',
    'SUPER_ADMIN',
    'OWNER',
    'MANAGER',
    'EMPLOYEE',
    'RECEPTIONIST',
  ]),
  disabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
