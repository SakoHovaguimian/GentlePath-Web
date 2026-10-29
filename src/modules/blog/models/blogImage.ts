import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import { BlogImageUrlSchema } from './blogContentUrl';

export const BlogImageSchema = z.object({
  src: BlogImageUrlSchema,
  alt: z
    .string()
    .trim()
    .min(1, copy.uploadAltRequired)
    .max(500, copy.invalidImage),
  caption: z.string().trim().max(1000, copy.invalidText).default(''),
});
export type BlogImage = z.infer<typeof BlogImageSchema>;
