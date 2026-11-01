import { z } from 'zod';
import { ResourceRatingSummarySchema } from '@/modules/engagement/models/resourceRatingSummary';

export const ResourceCategorySchema = z.enum([
  'everyday',
  'education',
  'communication',
  'wellbeing',
]);
export const ResourceSchema = z.object({
  id: z.string(),
  milestone_ids: z.array(z.string()).default([]),
  state_codes: z.array(z.string()).default([]),
  official_source_url: z.string().nullable().default(null),
  verified_at: z.string().nullable().default(null),
  title: z.string(),
  description: z.string(),
  category: ResourceCategorySchema,
  format: z.enum(['guide', 'article', 'toolkit']),
  readMinutes: z.number().nonnegative(),
  body: z.string(),
  saved: z.boolean(),
  ratings: ResourceRatingSummarySchema.default({ count: 0, average: null }),
  sourceName: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
  sourcePublishedAt: z.string().nullable().optional(),
  reviewedAt: z.string().optional(),
  reviewedByUserId: z.string().optional(),
  parentId: z.string().nullable().optional(),
  resourceType: z.string().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  childrenCount: z.number().optional(),
  url: z.string().nullable().optional(),
});
export type Resource = z.infer<typeof ResourceSchema>;
export type ResourceCategory = z.infer<typeof ResourceCategorySchema>;
