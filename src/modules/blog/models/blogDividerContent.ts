import { z } from 'zod';

export const BlogDividerContentSchema = z.object({
  id: z.string().uuid(),
  contentType: z.literal('divider'),
  metaData: z.object({}),
});
export type BlogDividerContent = z.infer<typeof BlogDividerContentSchema>;
