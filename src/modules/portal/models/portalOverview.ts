import { z } from 'zod';

export const PortalOverviewSchema = z.object({
  journalCount: z.number().nonnegative(),
  savedCount: z.number().nonnegative(),
  observationCount: z.number().nonnegative(),
  childCount: z.number().nonnegative(),
  weeklyActivity: z.array(z.number().nonnegative()).length(7),
});
export type PortalOverview = z.infer<typeof PortalOverviewSchema>;
