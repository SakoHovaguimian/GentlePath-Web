import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import { BlogHeaderContentSchema } from './blogHeaderContent';
import { BlogSectionContentSchema } from './blogSectionContent';
import { BlogFooterContentSchema } from './blogFooterContent';
import { BlogQuoteContentSchema } from './blogQuoteContent';
import { BlogBulletContentSchema } from './blogBulletContent';
import { BlogDividerContentSchema } from './blogDividerContent';
import { BlogEmbedContentSchema } from './blogEmbedContent';
import { BlogImageContentSchema } from './blogImageContent';
import { BlogGalleryTwoContentSchema } from './blogGalleryTwoContent';
import { BlogGalleryThreeContentSchema } from './blogGalleryThreeContent';
import { BlogGalleryFourContentSchema } from './blogGalleryFourContent';
import { BlogCalloutContentSchema } from './blogCalloutContent';
import { BlogLinkContentSchema } from './blogLinkContent';

export const BlogContentSchema = z.discriminatedUnion('contentType', [
  BlogHeaderContentSchema,
  BlogSectionContentSchema,
  BlogFooterContentSchema,
  BlogQuoteContentSchema,
  BlogBulletContentSchema,
  BlogDividerContentSchema,
  BlogEmbedContentSchema,
  BlogImageContentSchema,
  BlogGalleryTwoContentSchema,
  BlogGalleryThreeContentSchema,
  BlogGalleryFourContentSchema,
  BlogCalloutContentSchema,
  BlogLinkContentSchema,
]);
export type BlogContent = z.infer<typeof BlogContentSchema>;
export const BlogContentsSchema = z
  .array(BlogContentSchema)
  .max(100, copy.tooManyBlocks)
  .superRefine((items, context) => {
    if (new Set(items.map((item) => item.id)).size !== items.length)
      context.addIssue({ code: 'custom', message: copy.duplicateBlocks });
    if (new TextEncoder().encode(JSON.stringify(items)).length > 250000)
      context.addIssue({ code: 'custom', message: copy.invalidContentSize });
  });
