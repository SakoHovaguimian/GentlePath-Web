import { z } from 'zod';
import { BlogImageSchema } from './blogImage';

export const BlogImageContentSchema = z.object({
  id: z.string().uuid(),
  contentType: z.literal('image'),
  metaData: BlogImageSchema,
});
export type BlogImageContent = z.infer<typeof BlogImageContentSchema>;
