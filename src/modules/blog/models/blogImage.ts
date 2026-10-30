import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import { BlogImageUrlSchema } from './blogContentUrl';

export const BlogImageSchema = z
  .object({
    src: BlogImageUrlSchema,
    alt: z
      .string()
      .trim()
      .min(1, copy.uploadAltRequired)
      .max(500, copy.invalidImage),
    caption: z.string().trim().max(1000, copy.invalidCaption).default(''),
  })
  .strict();
export type BlogImage = z.infer<typeof BlogImageSchema>;

export const BlogReadableImageSchema = z
  .object({
    src: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
  })
  .passthrough();
export type BlogReadableImage = z.infer<typeof BlogReadableImageSchema>;
