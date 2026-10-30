import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';

export const BlogQuoteContentSchema = z
  .object({
    id: z.string().uuid(),
    contentType: z.literal('quote'),
    metaData: z
      .object({
        text: z
          .string()
          .trim()
          .min(1, copy.invalidShortText)
          .max(4000, copy.invalidShortText),
        attribution: z
          .string()
          .trim()
          .max(200, copy.invalidAttribution)
          .default(''),
      })
      .strict(),
  })
  .strict();
export type BlogQuoteContent = z.infer<typeof BlogQuoteContentSchema>;

export const BlogReadableQuoteContentSchema = BlogQuoteContentSchema.extend({
  metaData: z
    .object({ text: z.string(), attribution: z.string().optional() })
    .passthrough(),
}).passthrough();
