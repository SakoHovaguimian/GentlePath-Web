'use client';

import type { AppSidebarProps } from '../models/appSidebarProps';
import { AppSidebarContent } from './AppSidebarContent';

export type { AppSidebarItem } from '../models/sidebarItem';

export function AppSidebar(props: AppSidebarProps) {
  return (
    <aside className="ui-app-sidebar fixed inset-y-0 start-0 z-40 hidden h-dvh w-[var(--dashboard-sidebar-width)] overflow-y-auto overscroll-y-none rounded-e-[var(--dashboard-sidebar-radius)] border-e border-[var(--dashboard-shell-border)] bg-[var(--dashboard-shell-panel-solid)] shadow-[var(--dashboard-sidebar-shadow)] lg:block">
      <AppSidebarContent {...props} />
    </aside>
  );
}
