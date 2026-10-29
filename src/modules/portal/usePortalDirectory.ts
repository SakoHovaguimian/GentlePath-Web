'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';

export function usePortalDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const rawOffset = Number(params.get('offset') ?? 0);
  const offset =
    Number.isSafeInteger(rawOffset) && rawOffset > 0 ? rawOffset : 0;
  function update(values: Record<string, string | undefined>) {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    router.replace(`${pathname}${next.size ? `?${next}` : ''}` as Route, {
      scroll: false,
    });
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
