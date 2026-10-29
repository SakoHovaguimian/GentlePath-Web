import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import { BlogContentUrlSchema } from './blogContentUrl';

export const BlogLinkContentSchema = z.object({
  id: z.string().uuid(),
  contentType: z.literal('link'),
  metaData: z.object({
    url: BlogContentUrlSchema,
    text: z
      .string()
      .trim()
      .min(1, copy.invalidHeading)
      .max(200, copy.invalidHeading),
  }),
});
export type BlogLinkContent = z.infer<typeof BlogLinkContentSchema>;
