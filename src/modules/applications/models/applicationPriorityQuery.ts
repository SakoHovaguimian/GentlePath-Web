import { z } from 'zod';

export const ApplicationPriorityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(12),
  offset: z.coerce.number().int().nonnegative().safe().default(0),
});

export type ApplicationPriorityQuery = z.infer<
  typeof ApplicationPriorityQuerySchema
>;
