import { z } from 'zod';
import { BlogImageUrlSchema } from './blogContentUrl';

export const blogImageMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;
export const blogImageMaxBytes = 5 * 1024 * 1024;
export const BlogMediaSchema = z.object({
  fileName: z.string().min(1),
  thumbnailFileName: z.string().nullable().optional(),
  visibility: z.literal('public'),
  url: BlogImageUrlSchema,
  thumbnailUrl: BlogImageUrlSchema.nullable().optional(),
});
export type BlogMedia = z.infer<typeof BlogMediaSchema>;
