import { z } from 'zod';

export const EditorialPageMetadataSchema = z.object({
  limit: z.number().int().min(1).max(100),
  offset: z.number().int().nonnegative(),
  hasMore: z.boolean(),
  nextOffset: z.number().nullable(),
});
export const editorialPageSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    data: z.array(item),
    page: EditorialPageMetadataSchema,
  });
