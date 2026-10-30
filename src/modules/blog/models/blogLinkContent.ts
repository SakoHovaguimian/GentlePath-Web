import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import {
  BlogContentUrlSchema,
  BlogReadableContentUrlSchema,
} from './blogContentUrl';

export const BlogLinkContentSchema = z
  .object({
    id: z.string().uuid(),
    contentType: z.literal('link'),
    metaData: z
      .object({
        url: BlogContentUrlSchema,
        text: z
          .string()
          .trim()
          .min(1, copy.invalidHeading)
          .max(200, copy.invalidHeading),
      })
      .strict(),
  })
  .strict();
export type BlogLinkContent = z.infer<typeof BlogLinkContentSchema>;

export const BlogReadableLinkContentSchema = BlogLinkContentSchema.extend({
  metaData: z
    .object({ url: BlogReadableContentUrlSchema, text: z.string() })
    .passthrough(),
}).passthrough();
