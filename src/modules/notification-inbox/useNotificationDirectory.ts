'use client';
import { useSearchParams } from 'next/navigation';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { NotificationCategorySchema } from './models/notificationCategory';
import type { NotificationInboxQuery } from './models/notificationInboxQuery';

export function useNotificationDirectory() {
  const directory = usePortalDirectory();
  const params = useSearchParams();
  const category = NotificationCategorySchema.safeParse(params.get('category'));
  const read = params.get('read');
  const query: NotificationInboxQuery = {
    ...(directory.query.trim()
      ? { query: directory.query.trim().slice(0, 200) }
      : {}),
    ...(category.success ? { category: category.data } : {}),
    ...(read === 'true' || read === 'false' ? { read: read === 'true' } : {}),
    offset: Math.min(1_000_000, Math.floor(directory.offset / 20) * 20),
    limit: 20,
    sortOrder: params.get('sortOrder') === 'asc' ? 'asc' : 'desc',
  };
  return {
    ...directory,
    query,
    clearFilters: () =>
      directory.update({
        query: undefined,
        category: undefined,
        read: undefined,
        offset: undefined,
      }),
  };
}
