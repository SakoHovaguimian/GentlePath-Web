import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';

export const BlogHeaderContentSchema = z.object({
  id: z.string().uuid(),
  contentType: z.literal('header'),
  metaData: z.object({
    text: z
      .string()
      .trim()
      .min(1, copy.invalidHeading)
      .max(200, copy.invalidHeading),
  }),
});
export type BlogHeaderContent = z.infer<typeof BlogHeaderContentSchema>;
