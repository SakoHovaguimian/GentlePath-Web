import { z } from 'zod';

export const BlogContentTypeSchema = z.enum([
  'header',
  'section',
  'footer',
  'quote',
  'bullet',
  'divider',
  'embed',
  'image',
  'gallery2',
  'gallery3',
  'gallery4',
  'callout',
  'link',
]);
export type BlogContentType = z.infer<typeof BlogContentTypeSchema>;
