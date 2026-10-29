import { z } from 'zod';

export const AccountToolsPageMetadataSchema = z.object({
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
  hasMore: z.boolean(),
  nextOffset: z.number().int().nonnegative().nullable(),
});
export function accountToolsPageSchema<T extends z.ZodType>(item: T) {
  return z.object({
    data: z.array(item),
    page: AccountToolsPageMetadataSchema,
  });
}
