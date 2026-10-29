import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';

export const BlogCalloutContentSchema = z.object({
  id: z.string().uuid(),
  contentType: z.literal('callout'),
  metaData: z.object({
    title: z
      .string()
      .trim()
      .min(1, copy.invalidHeading)
      .max(200, copy.invalidHeading),
    text: z
      .string()
      .trim()
      .min(1, copy.invalidText)
      .max(4000, copy.invalidText),
  }),
});
export type BlogCalloutContent = z.infer<typeof BlogCalloutContentSchema>;
