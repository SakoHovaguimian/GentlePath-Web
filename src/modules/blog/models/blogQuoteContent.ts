import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';

export const BlogQuoteContentSchema = z.object({
  id: z.string().uuid(),
  contentType: z.literal('quote'),
  metaData: z.object({
    text: z
      .string()
      .trim()
      .min(1, copy.invalidText)
      .max(4000, copy.invalidText),
    attribution: z.string().trim().max(200, copy.invalidText).default(''),
  }),
});
export type BlogQuoteContent = z.infer<typeof BlogQuoteContentSchema>;
