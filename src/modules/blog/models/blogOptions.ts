import { z } from 'zod';
import { BlogCategorySchema } from './blogCategory';
import { BlogCoverChoiceSchema } from './blogCoverChoice';
export const BlogOptionsSchema = z.object({
  categories: z.array(BlogCategorySchema),
  covers: z.array(BlogCoverChoiceSchema),
});
export type BlogOptions = z.infer<typeof BlogOptionsSchema>;
