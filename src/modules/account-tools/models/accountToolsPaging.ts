import { z } from 'zod';

export const AccountToolsPagingSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce
    .number()
    .int()
    .min(0)
    .max(Number.MAX_SAFE_INTEGER)
    .default(0),
});
export type AccountToolsPaging = z.infer<typeof AccountToolsPagingSchema>;
