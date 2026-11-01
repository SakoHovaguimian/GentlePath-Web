'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { PostKindSchema } from './models/postKind';
import { AgeBandSchema } from './models/ageBand';
import { USStateCodeSchema } from '@/modules/onboarding/models/usStateCode';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';

export function useCommunityDirectory() {
  const params = useSearchParams();
  const pathname = usePathname();
  const directory = usePortalDirectory();
  return {
    ...directory,
    postKind: PostKindSchema.safeParse(params.get('kind')).data,
    ageBand: AgeBandSchema.safeParse(params.get('age')).data,
    stateCode: USStateCodeSchema.safeParse(params.get('state')).data,
    milestoneId: params.get('milestone') || undefined,
    compose: params.get('compose') === '1',
    composeReturnTo: params.get('returnTo')?.startsWith('/milestones/')
      ? communityReturnPath(params.get('returnTo'))
      : undefined,
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
      (!['/community', '/milestones'].includes(url.pathname) &&
        !/^\/milestones\/[a-zA-Z0-9_-]+$/.test(url.pathname))
    )
      return '/community';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/community';
  }
}
