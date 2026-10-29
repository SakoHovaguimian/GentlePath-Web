import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Retain recent pages during Back/Forward navigation. Mutations and
        // realtime events still invalidate their authoritative query keys.
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry(failureCount, error) {
          const status = (error as { status?: number })?.status;
          if (status && [401, 403, 404].includes(status)) {
            return false;
          }
          return failureCount < 1;
        },
      },
    },
  });
}
