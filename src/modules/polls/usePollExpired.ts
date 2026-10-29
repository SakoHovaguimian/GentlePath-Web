'use client';
import { useEffect, useState } from 'react';
import type { Poll } from './models/poll';

export function usePollExpired(poll: Poll): boolean {
  const key = `${poll.id}:${poll.expiresAt ?? ''}`;
  const [expiredKey, setExpiredKey] = useState<string | null>(null);
  useEffect(() => {
    if (!poll.expiresAt || poll.isExpired) return;
    const deadline = Date.parse(poll.expiresAt);
    if (!Number.isFinite(deadline)) return;
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) setExpiredKey(key);
      else timer = setTimeout(update, Math.min(remaining, 2147483647));
    };
    timer = setTimeout(update, 0);
    return () => clearTimeout(timer);
  }, [key, poll.expiresAt, poll.isExpired]);
  return poll.isExpired || expiredKey === key;
}
