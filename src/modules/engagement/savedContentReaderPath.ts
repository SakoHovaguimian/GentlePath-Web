import type { SavedContentType } from './models/savedContentType';
/** Generate internal links from typed identifiers, never from backend-provided URLs. */
export function savedContentReaderPath(
  type: SavedContentType,
  id: string,
  parentId: string | null = null,
  slug?: string,
): string | null {
  if (
    !/^[a-zA-Z0-9_-]+$/.test(id) ||
    (parentId && !/^[a-zA-Z0-9_-]+$/.test(parentId))
  )
    return null;
  const key = encodeURIComponent(id);
  if (type === 'RESOURCE') return `/resources/${key}`;
  if (type === 'GUIDED_STEP') return `/guides/${key}`;
  if (type === 'BLOG')
    return slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
      ? `/blog/${encodeURIComponent(slug)}`
      : null;
  if (type === 'POST') return `/community/${key}`;
  if (type === 'POLL') return `/polls/${key}`;
  if (type === 'POST_COMMENT' && parentId)
    return `/community/${encodeURIComponent(parentId)}`;
  if (type === 'POLL_COMMENT' && parentId)
    return `/polls/${encodeURIComponent(parentId)}`;
  return null;
}
