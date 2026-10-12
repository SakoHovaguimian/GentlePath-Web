import type { ReactNode } from 'react';
import type { AppSession } from '@/models';
import type { AppSidebarItem } from './sidebarItem';

export type AppSidebarProps = {
  session: AppSession;
  items: AppSidebarItem[];
  onNavigate?: (href: string) => void;
  accountSlot?: ReactNode;
  activePath?: string;
  contextSlot?: ReactNode;
};
