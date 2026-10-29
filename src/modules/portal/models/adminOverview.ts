import { z } from 'zod';

export const AdminOverviewSchema = z.object({
  userCount: z.number().nonnegative(),
  activeUserCount: z.number().nonnegative(),
  publishedBlogCount: z.number().nonnegative(),
  draftBlogCount: z.number().nonnegative(),
  openReportCount: z.number().nonnegative(),
  resourceCount: z.number().nonnegative(),
  roleCounts: z.object({
    user: z.number().nonnegative(),
    admin: z.number().nonnegative(),
    superadmin: z.number().nonnegative(),
  }),
  weeklyRegistrations: z.array(z.number().nonnegative()).length(7),
});
export type AdminOverview = z.infer<typeof AdminOverviewSchema>;
