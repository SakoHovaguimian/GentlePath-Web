import { z } from 'zod';
import { gentlePathBlogStrings as copy } from '@/strings';

export const blogCategoryPresets = [
  'family',
  'community',
  'practical',
  'stories',
] as const;
export const BlogCategorySchema = z
  .string()
  .trim()
  .min(2, copy.invalidTopic)
  .max(80, copy.invalidTopic);
export type BlogCategory = z.infer<typeof BlogCategorySchema>;
export function blogCategoryLabel(category: string) {
  return Object.hasOwn(copy.categories, category)
    ? copy.categories[category as keyof typeof copy.categories]
    : category;
}
