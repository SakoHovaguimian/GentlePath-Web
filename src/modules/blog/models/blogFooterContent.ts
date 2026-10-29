import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';

export const BlogFooterContentSchema = z.object({
  id: z.string().uuid(),
  contentType: z.literal('footer'),
  metaData: z.object({
    text: z
      .string()
      .trim()
      .min(1, copy.invalidText)
      .max(4000, copy.invalidText),
  }),
});
export type BlogFooterContent = z.infer<typeof BlogFooterContentSchema>;
