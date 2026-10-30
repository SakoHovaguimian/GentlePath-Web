import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';

export const BlogHeaderContentSchema = z
  .object({
    id: z.string().uuid(),
    contentType: z.literal('header'),
    metaData: z
      .object({
        text: z
          .string()
          .trim()
          .min(1, copy.invalidHeading)
          .max(200, copy.invalidHeading),
      })
      .strict(),
  })
  .strict();
export type BlogHeaderContent = z.infer<typeof BlogHeaderContentSchema>;

export const BlogReadableHeaderContentSchema = BlogHeaderContentSchema.extend({
  metaData: z.object({ text: z.string() }).passthrough(),
}).passthrough();
