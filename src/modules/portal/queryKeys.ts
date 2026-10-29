export const portalQueryKeys = {
  all: ['gentlepath', 'portal'] as const,
  overview: ['gentlepath', 'portal', 'overview'] as const,
  children: ['gentlepath', 'portal', 'children'] as const,
  journals: ['gentlepath', 'portal', 'journals'] as const,
  resources: ['gentlepath', 'portal', 'resources'] as const,
  milestones: (childId: string) =>
    ['gentlepath', 'portal', 'milestones', childId] as const,
};
export const adminQueryKeys = {
  all: ['gentlepath', 'admin'] as const,
  overview: ['gentlepath', 'admin', 'overview'] as const,
  users: ['gentlepath', 'admin', 'users'] as const,
  reports: ['gentlepath', 'admin', 'reports'] as const,
  settings: ['gentlepath', 'admin', 'settings'] as const,
};
