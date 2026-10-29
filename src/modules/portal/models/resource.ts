import { z } from 'zod';

export const ResourceCategorySchema = z.enum([
  'everyday',
  'education',
  'communication',
  'wellbeing',
]);
export const ResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: ResourceCategorySchema,
  format: z.enum(['guide', 'article', 'toolkit']),
  readMinutes: z.number().nonnegative(),
  body: z.string(),
  saved: z.boolean(),
});
export type Resource = z.infer<typeof ResourceSchema>;
export type ResourceCategory = z.infer<typeof ResourceCategorySchema>;
