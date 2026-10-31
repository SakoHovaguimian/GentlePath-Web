import { z } from 'zod';

export const ApplicationLifecycleSchema = z.object({
  deleted: z.boolean(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
});
