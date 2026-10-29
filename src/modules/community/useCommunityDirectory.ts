'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';

export function useCommunityDirectory() {
  const params = useSearchParams();
  const pathname = usePathname();
  const directory = usePortalDirectory();
  return {
    ...directory,
    query: directory.query.slice(0, 200),
    scope:
      params.get('scope') === 'mine' ? ('mine' as const) : ('all' as const),
    tag: (params.get('tag') ?? '').slice(0, 100),
    href: `${pathname}${params.size ? `?${params}` : ''}`,
  };
}

export function communityReturnPath(value: string | null) {
  if (!value) return '/community';
  try {
    const url = new URL(value, 'https://gentlepath.internal');
    if (
      url.origin !== 'https://gentlepath.internal' ||
      url.pathname !== '/community'
    )
      return '/community';
    return `${url.pathname}${url.search}`;
  } catch {
    return '/community';
  }
}
