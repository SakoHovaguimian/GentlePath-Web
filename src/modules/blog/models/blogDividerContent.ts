import { z } from 'zod';

export const BlogDividerContentSchema = z
  .object({
    id: z.string().uuid(),
    contentType: z.literal('divider'),
    metaData: z.object({}),
  })
  .strict();
export type BlogDividerContent = z.infer<typeof BlogDividerContentSchema>;

export const BlogReadableDividerContentSchema = BlogDividerContentSchema.extend(
  {
    metaData: z.object({}).passthrough(),
  },
).passthrough();
