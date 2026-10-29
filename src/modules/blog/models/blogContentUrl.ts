import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';

export function isPublicHttpsUrl(value: string): boolean {
  if (/[\s\\\u0000-\u001f\u007f]/.test(value)) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      !host.includes('.')
    )
      return false;
    return !/^(localhost|.*\.(localhost|local|internal|test|invalid)|127\..*|10\..*|192\.168\..*|169\.254\..*|172\.(1[6-9]|2\d|3[01])\..*|0\..*|\[.*\])$/.test(
      host,
    );
  } catch {
    return false;
  }
}
export function isPublicImageUrl(value: string): boolean {
  if (!isPublicHttpsUrl(value)) return false;
  try {
    const url = new URL(value);
    const path = decodeURIComponent(url.pathname);
    return (
      !url.search &&
      !url.hash &&
      !path.includes('%') &&
      !/(^|\/)(care-documents|care_documents|private)(\/|$)/i.test(path)
    );
  } catch {
    return false;
  }
}
export const BlogContentUrlSchema = z
  .string()
  .trim()
  .max(2000, copy.invalidUrl)
  .refine(isPublicHttpsUrl, copy.invalidUrl);
export const BlogImageUrlSchema = z
  .string()
  .trim()
  .max(2000, copy.invalidImageUrl)
  .refine(
    (value) =>
      isPublicImageUrl(value) ||
      /^\/api\/public\/blog-media\/[0-9a-f-]{36}$/.test(value),
    copy.invalidImageUrl,
  );
