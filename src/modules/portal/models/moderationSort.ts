import { z } from 'zod';

export const ModerationSortSchema = z.enum([
  'latest',
  'oldest',
  'reviewed',
  'title',
]);
export type ModerationSort = z.infer<typeof ModerationSortSchema>;
