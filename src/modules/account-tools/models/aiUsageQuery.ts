import { z } from 'zod';
import { AccountToolsPagingSchema } from './accountToolsPaging';

export const AIUsageQuerySchema = AccountToolsPagingSchema.extend({
  query: z.string().trim().max(500).default(''),
  userId: z.union([z.literal('system'), z.string().uuid()]).optional(),
  context: z.string().trim().max(500).optional(),
  deleted: z.enum(['true', 'false']).default('false'),
}).strict();
export type AIUsageQuery = z.infer<typeof AIUsageQuerySchema>;
