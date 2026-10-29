import type { MilestoneAdminQuery } from './models/milestoneAdminQuery';
export const milestoneAdminKeys = {
  all: ['gentlepath', 'milestone-admin'] as const,
  milestones: (query: MilestoneAdminQuery) =>
    ['gentlepath', 'milestone-admin', 'milestones', query] as const,
  milestone: (id: string) =>
    ['gentlepath', 'milestone-admin', 'milestone', id] as const,
  tips: (scope: string, query: MilestoneAdminQuery) =>
    ['gentlepath', 'milestone-admin', 'tips', scope, query] as const,
  tip: (id: string) => ['gentlepath', 'milestone-admin', 'tip', id] as const,
};
