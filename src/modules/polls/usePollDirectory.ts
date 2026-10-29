'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { PollSelectionModeSchema } from './models/pollSelectionMode';

export function usePollDirectory() {
  const directory = usePortalDirectory();
  const params = useSearchParams();
  const pathname = usePathname();
  const mode = PollSelectionModeSchema.safeParse(params.get('mode'));
  const commentOffset = Number(params.get('commentOffset') ?? 0);
  return {
    ...directory,
    query: directory.query.slice(0, 200),
    tag: (params.get('tag') ?? '').slice(0, 100),
    scope:
      params.get('scope') === 'mine' ? ('mine' as const) : ('all' as const),
    selectionMode: mode.success ? mode.data : undefined,
    commentOffset:
      Number.isSafeInteger(commentOffset) && commentOffset > 0
        ? commentOffset
        : 0,
    setCommentOffset: (offset: number) =>
      directory.update({ commentOffset: offset ? String(offset) : undefined }),
    href: `${pathname}${params.size ? `?${params}` : ''}`,
  };
}
export function pollReturnPath(value: string | null) {
  if (!value) return '/polls';
  try {
    const url = new URL(value, 'https://gentlepath.internal');
    return url.origin === 'https://gentlepath.internal' &&
      url.pathname === '/polls'
      ? `${url.pathname}${url.search}`
      : '/polls';
  } catch {
    return '/polls';
  }
}
