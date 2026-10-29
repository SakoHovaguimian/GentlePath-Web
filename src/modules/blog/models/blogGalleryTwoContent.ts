import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import { BlogImageSchema } from './blogImage';

export const BlogGalleryTwoContentSchema = z.object({
  id: z.string().uuid(),
  contentType: z.literal('gallery2'),
  metaData: z.object({
    images: z.array(BlogImageSchema).length(2, copy.invalidGallery),
    caption: z.string().trim().max(1000, copy.invalidText).default(''),
  }),
});
export type BlogGalleryTwoContent = z.infer<typeof BlogGalleryTwoContentSchema>;
