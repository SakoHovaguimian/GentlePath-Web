import { z } from 'zod';
import { BlogImageSchema, BlogReadableImageSchema } from './blogImage';

export const BlogImageContentSchema = z
  .object({
    id: z.string().uuid(),
    contentType: z.literal('image'),
    metaData: BlogImageSchema,
  })
  .strict();
export type BlogImageContent = z.infer<typeof BlogImageContentSchema>;

export const BlogReadableImageContentSchema = BlogImageContentSchema.extend({
  metaData: BlogReadableImageSchema,
}).passthrough();
