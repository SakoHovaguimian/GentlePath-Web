'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { MilestoneAdminQuerySchema } from './models/milestoneAdminQuery';
import type { MilestoneDirectoryUpdates } from './models/milestoneDirectoryUpdates';
export function useMilestoneDirectory(defaultLimit = 25) {
  const pathname = usePathname();
  const params = useSearchParams();
  const parsed = MilestoneAdminQuerySchema.safeParse({
    ...Object.fromEntries(params),
    tags: params.has('tags') ? params.getAll('tags') : undefined,
    limit: params.get('limit') ?? defaultLimit,
  });
  const query = parsed.success
    ? parsed.data
    : MilestoneAdminQuerySchema.parse({ limit: defaultLimit });
  function update(values: MilestoneDirectoryUpdates) {
    if (window.location.pathname !== pathname) return;
    const next = new URLSearchParams(window.location.search);
    Object.entries(values).forEach(([key, value]) => {
      next.delete(key);
      if (Array.isArray(value)) value.forEach((tag) => next.append(key, tag));
      else if (value !== '' && value !== undefined && value !== 0)
        next.set(key, String(value));
    });
    const href = `${pathname}${next.size ? `?${next}` : ''}`;
    if (href !== window.location.pathname + window.location.search)
      window.history.pushState(null, '', href);
  }
  return {
    query,
    update,
    scope:
      params.get('view') === 'mine' ? ('mine' as const) : ('approved' as const),
  };
}
