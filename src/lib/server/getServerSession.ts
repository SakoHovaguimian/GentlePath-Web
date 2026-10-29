import 'server-only';
import { cache } from 'react';
import { getContainer } from '@/container';
export const getServerSession = cache(async () =>
  (await getContainer()).sessionService.publicSession(),
);
