import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import { BlogContentUrlSchema } from './blogContentUrl';

export const BlogEmbedContentSchema = z.object({
  id: z.string().uuid(),
  contentType: z.literal('embed'),
  metaData: z.object({
    url: BlogContentUrlSchema,
    title: z
      .string()
      .trim()
      .min(1, copy.invalidHeading)
      .max(200, copy.invalidHeading),
    caption: z.string().trim().max(1000, copy.invalidText).default(''),
  }),
});
export type BlogEmbedContent = z.infer<typeof BlogEmbedContentSchema>;
