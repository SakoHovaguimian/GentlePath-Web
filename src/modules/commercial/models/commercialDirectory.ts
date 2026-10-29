import { z } from 'zod';
export const CommercialPageMetadataSchema = z.object({
  limit: z.number().int().min(1).max(100),
  offset: z.number().int().nonnegative().safe(),
  hasMore: z.boolean(),
  nextOffset: z.number().int().nonnegative().safe().nullable(),
});
export function commercialPageSchema<T extends z.ZodTypeAny>(schema: T) {
  return z.object({
    data: z.array(schema),
    page: CommercialPageMetadataSchema,
  });
}
export interface CommercialFilters {
  [key: string]: string | number | boolean | undefined;
}
export interface CommercialPage<T> {
  data: T[];
  page: z.infer<typeof CommercialPageMetadataSchema>;
}
