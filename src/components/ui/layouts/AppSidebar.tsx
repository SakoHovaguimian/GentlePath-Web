'use client';

import type { AppSidebarProps } from '../models/appSidebarProps';
import { AppSidebarContent } from './AppSidebarContent';

export type { AppSidebarItem } from '../models/sidebarItem';

export function AppSidebar(props: AppSidebarProps) {
  return (
    <aside className="ui-app-sidebar fixed inset-y-0 inset-s-0 z-40 hidden h-dvh w-(--dashboard-sidebar-width) overflow-hidden rounded-e-(--dashboard-sidebar-radius) bg-(--dashboard-sidebar-bg) shadow-(--dashboard-sidebar-shadow) lg:block">
      <AppSidebarContent {...props} />
    </aside>
  );
}
