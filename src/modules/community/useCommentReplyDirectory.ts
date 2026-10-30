'use client';

import { useSearchParams } from 'next/navigation';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';

export function useCommentReplyDirectory(parentId: string) {
  const params = useSearchParams();
  const directory = usePortalDirectory();
  const key = `reply_${parentId}`;
  const rawOffset = Number(params.get(key) ?? 0);
  const offset =
    Number.isSafeInteger(rawOffset) && rawOffset > 0 ? rawOffset : 0;
  return {
    offset,
    setOffset: (value: number) =>
      directory.update({
        [key]:
          Number.isSafeInteger(value) && value > 0 ? String(value) : undefined,
      }),
  };
}
