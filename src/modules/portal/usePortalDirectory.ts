'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export function usePortalDirectory() {
  const pathname = usePathname();
  const params = useSearchParams();
  const rawOffset = Number(params.get('offset') ?? 0);
  const offset =
    Number.isSafeInteger(rawOffset) && rawOffset > 0 ? rawOffset : 0;
  function update(values: Record<string, string | undefined>) {
    // Ignore a debounced update from a page that navigation already left.
    if (window.location.pathname !== pathname) return;
    const next = new URLSearchParams(window.location.search);
    Object.entries(values).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    const href = `${pathname}${next.size ? `?${next}` : ''}`;
    if (href === window.location.pathname + window.location.search) return;
    // These filters own client query state; Next's History API integration
    // updates useSearchParams without a redundant server navigation.
    window.history.pushState(null, '', href);
  }
  return {
    query: params.get('query') ?? '',
    status: params.get('status') ?? '',
    offset,
    update,
    setOffset: (value: number) =>
      update({ offset: value ? String(value) : undefined }),
  };
}
