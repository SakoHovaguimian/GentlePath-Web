import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';

export const BlogBulletContentSchema = z.object({
  id: z.string().uuid(),
  contentType: z.literal('bullet'),
  metaData: z.object({
    items: z
      .array(
        z
          .string()
          .trim()
          .min(1, copy.invalidItems)
          .max(1000, copy.invalidItems),
      )
      .min(1, copy.invalidItems)
      .max(30, copy.invalidItems),
  }),
});
export type BlogBulletContent = z.infer<typeof BlogBulletContentSchema>;
