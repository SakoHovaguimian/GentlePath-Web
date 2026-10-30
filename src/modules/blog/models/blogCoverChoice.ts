import { z } from 'zod';
import { BlogCoverSchema } from './blogCover';
export const BlogCoverChoiceSchema = z.object({
  value: BlogCoverSchema,
  title: z.string(),
});
export type BlogCoverChoice = z.infer<typeof BlogCoverChoiceSchema>;
