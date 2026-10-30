import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import { BlogImageSchema, BlogReadableImageSchema } from './blogImage';

export const BlogGalleryTwoContentSchema = z
  .object({
    id: z.string().uuid(),
    contentType: z.literal('gallery2'),
    metaData: z
      .object({
        images: z.array(BlogImageSchema).length(2, copy.invalidGallery),
        caption: z.string().trim().max(1000, copy.invalidCaption).default(''),
      })
      .strict(),
  })
  .strict();
export type BlogGalleryTwoContent = z.infer<typeof BlogGalleryTwoContentSchema>;

export const BlogReadableGalleryTwoContentSchema =
  BlogGalleryTwoContentSchema.extend({
    metaData: z
      .object({
        images: z.array(BlogReadableImageSchema),
        caption: z.string().optional(),
      })
      .passthrough(),
  }).passthrough();
