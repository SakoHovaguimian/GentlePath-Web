import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import { BlogImageSchema } from './blogImage';

export const BlogGalleryThreeContentSchema = z.object({
  id: z.string().uuid(),
  contentType: z.literal('gallery3'),
  metaData: z.object({
    images: z.array(BlogImageSchema).length(3, copy.invalidGallery),
    caption: z.string().trim().max(1000, copy.invalidText).default(''),
  }),
});
export type BlogGalleryThreeContent = z.infer<
  typeof BlogGalleryThreeContentSchema
>;
