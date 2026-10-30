import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';

export const BlogFooterContentSchema = z
  .object({
    id: z.string().uuid(),
    contentType: z.literal('footer'),
    metaData: z
      .object({
        text: z
          .string()
          .trim()
          .min(1, copy.invalidShortText)
          .max(4000, copy.invalidShortText),
      })
      .strict(),
  })
  .strict();
export type BlogFooterContent = z.infer<typeof BlogFooterContentSchema>;

export const BlogReadableFooterContentSchema = BlogFooterContentSchema.extend({
  metaData: z.object({ text: z.string() }).passthrough(),
}).passthrough();
