import { z } from 'zod';
export const MilestoneAdminPageMetadataSchema = z.object({
  limit: z.number().int().min(1).max(100),
  offset: z.number().int().nonnegative(),
  hasMore: z.boolean(),
  nextOffset: z.number().int().nonnegative().nullable(),
});
export const milestoneAdminPageSchema = <T extends z.ZodType>(schema: T) =>
  z.object({ data: z.array(schema), page: MilestoneAdminPageMetadataSchema });
export interface MilestoneAdminPage<T> {
  data: T[];
  page: z.infer<typeof MilestoneAdminPageMetadataSchema>;
}
