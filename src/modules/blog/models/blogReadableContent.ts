import { z } from 'zod';
import { BlogReadableHeaderContentSchema } from './blogHeaderContent';
import { BlogReadableSectionContentSchema } from './blogSectionContent';
import { BlogReadableFooterContentSchema } from './blogFooterContent';
import { BlogReadableQuoteContentSchema } from './blogQuoteContent';
import { BlogReadableBulletContentSchema } from './blogBulletContent';
import { BlogReadableDividerContentSchema } from './blogDividerContent';
import { BlogReadableEmbedContentSchema } from './blogEmbedContent';
import { BlogReadableImageContentSchema } from './blogImageContent';
import { BlogReadableGalleryTwoContentSchema } from './blogGalleryTwoContent';
import { BlogReadableGalleryThreeContentSchema } from './blogGalleryThreeContent';
import { BlogReadableGalleryFourContentSchema } from './blogGalleryFourContent';
import { BlogReadableCalloutContentSchema } from './blogCalloutContent';
import { BlogReadableLinkContentSchema } from './blogLinkContent';

// Display projections never replace the stored metadata or validate a write.
export const BlogReadableContentSchema = z.discriminatedUnion('contentType', [
  BlogReadableHeaderContentSchema,
  BlogReadableSectionContentSchema,
  BlogReadableFooterContentSchema,
  BlogReadableQuoteContentSchema,
  BlogReadableBulletContentSchema,
  BlogReadableDividerContentSchema,
  BlogReadableEmbedContentSchema,
  BlogReadableImageContentSchema,
  BlogReadableGalleryTwoContentSchema,
  BlogReadableGalleryThreeContentSchema,
  BlogReadableGalleryFourContentSchema,
  BlogReadableCalloutContentSchema,
  BlogReadableLinkContentSchema,
]);
export type BlogReadableContent = z.infer<typeof BlogReadableContentSchema>;
