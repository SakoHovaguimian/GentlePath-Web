import { z } from 'zod';

export const BlogCategorySchema = z.enum([
  'family',
  'community',
  'practical',
  'stories',
]);
export type BlogCategory = z.infer<typeof BlogCategorySchema>;
