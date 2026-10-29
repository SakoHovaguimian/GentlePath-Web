'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { MilestoneAdminQuerySchema } from './models/milestoneAdminQuery';
export function useMilestoneDirectory(defaultLimit = 25) {
  const pathname = usePathname();
  const params = useSearchParams();
  const parsed = MilestoneAdminQuerySchema.safeParse({
    ...Object.fromEntries(params),
    limit: params.get('limit') ?? defaultLimit,
  });
  const query = parsed.success
    ? parsed.data
    : MilestoneAdminQuerySchema.parse({ limit: defaultLimit });
  function update(values: Record<string, string | number | undefined>) {
    if (window.location.pathname !== pathname) return;
    const next = new URLSearchParams(window.location.search);
    Object.entries(values).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== 0)
        next.set(key, String(value));
      else next.delete(key);
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
