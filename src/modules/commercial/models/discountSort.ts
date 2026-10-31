import { z } from 'zod';
export const DiscountSortSchema = z.enum([
  'latest',
  'oldest',
  'expiring',
  'title',
]);
export type DiscountSort = z.infer<typeof DiscountSortSchema>;
