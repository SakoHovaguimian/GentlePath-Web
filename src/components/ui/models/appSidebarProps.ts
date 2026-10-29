import type { ReactNode } from 'react';
import type { AppSession } from '@/models';
import type { AppSidebarItem } from './sidebarItem';
import type { NavigationPermission } from './navigationPermission';

export interface AppSidebarProps {
  session: AppSession;
  items: AppSidebarItem[];
  onNavigate?: (href: string) => void;
  onBeforeNavigate?: NavigationPermission;
  accountSlot?: ReactNode;
  activePath?: string;
  contextSlot?: ReactNode;
  brandSlot?: ReactNode;
  navigationLabel?: string;
  supportSlot?: ReactNode;
}
