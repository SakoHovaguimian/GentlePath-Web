import type { ReactNode } from 'react';

export type AppSidebarItem = {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  activePaths?: string[];
  placement?: 'bottom';
  sectionLabel?: string;
};
