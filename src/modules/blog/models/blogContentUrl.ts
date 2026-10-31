import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';

import {
  isPublicHttpsUrl,
  isPublicImageReference,
} from '@/models/publicImageUrl';
export { isPublicHttpsUrl, isPublicImageUrl } from '@/models/publicImageUrl';

export const BlogContentUrlSchema = z
  .string()
  .trim()
  .max(2000, copy.invalidUrl)
  .refine(isPublicHttpsUrl, copy.invalidUrl);
export const isBlogImageUrl = isPublicImageReference;
export const BlogImageUrlSchema = z
  .string()
  .trim()
  .max(2000, copy.invalidImageUrl)
  .refine(isBlogImageUrl, copy.invalidImageUrl);

// Editors retain incomplete and older values; the reader checks URLs before use.
export const BlogReadableContentUrlSchema = z.string();
