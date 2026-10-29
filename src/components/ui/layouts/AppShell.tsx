import type { PropsWithChildren, ReactNode } from 'react';
import type { AppSession } from '@/models';
import { strings } from '@/strings';
import { AppSidebar, type AppSidebarItem } from './AppSidebar';
import { MobileNavigationMenu } from './MobileNavigationMenu';
import { UiIcon } from '../components/UiIcon';

const navigation: AppSidebarItem[] = [
  {
    href: '/dashboard',
    label: strings.ui.appShell.dashboard,
    icon: <UiIcon name="grid" />,
  },
  {
    href: '/users',
    label: strings.ui.appShell.users,
    icon: <UiIcon name="user" />,
  },
  {
    href: '/feature-requests',
    label: strings.ui.appShell.featureRequests,
    icon: <UiIcon name="file" />,
  },
  {
    href: '/chat',
    label: strings.ui.appShell.chat,
    icon: <UiIcon name="mail" />,
  },
  {
    href: '/profile',
    label: strings.ui.appShell.profile,
    icon: <UiIcon name="user" />,
  },
  {
    href: '/settings/appearance',
    label: strings.ui.appShell.appearance,
    icon: <UiIcon name="settings" />,
  },
  {
    href: '/dev-settings/components',
    label: strings.componentLibrary.title,
    icon: <UiIcon name="code" />,
    placement: 'bottom',
  },
];

export function AppShell({
  children,
  session,
  utilitySlot,
  accountSlot,
  bannerSlot,
  contextSlot,
  activePath,
  onNavigate,
  navigationItems,
  workspaceLabel,
  brandSlot,
}: PropsWithChildren<{
  session: AppSession;
  utilitySlot?: ReactNode;
  accountSlot?: ReactNode;
  bannerSlot?: ReactNode;
  contextSlot?: ReactNode;
  activePath?: string;
  onNavigate?: (href: string) => void;
  navigationItems?: AppSidebarItem[];
  workspaceLabel?: string;
  brandSlot?: ReactNode;
}>) {
  const items = (navigationItems ?? navigation).map((item) => ({
    ...item,
    active:
      activePath === item.href ||
      (item.href !== '/admin' &&
        item.href !== '/dashboard' &&
        activePath?.startsWith(`${item.href}/`)),
  }));
  const sidebar = {
    session,
    items,
    onNavigate,
    accountSlot,
    activePath,
    contextSlot,
    brandSlot,
  };
  return (
    <div className="ui-app-shell min-h-dvh bg-(--dashboard-shell-bg) lg:ps-(--dashboard-sidebar-width)">
      <a
        href="#main-content"
        className="fixed inset-s-4 top-4 z-50 -translate-y-24 rounded-lg bg-primary px-4 py-3 text-sm text-primary shadow-md focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand"
      >
        {strings.componentLibrary.skipToContent}
      </a>
      <AppSidebar {...sidebar} />
      <div className="min-w-0">
        <header className="top-0 z-30 border-b border-(--dashboard-shell-border) bg-(--dashboard-shell-topbar) backdrop-blur lg:sticky">
          <div className="mx-auto flex min-h-16 max-w-352 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <MobileNavigationMenu
                key={`${session.user.id}:${activePath}`}
                {...sidebar}
              />
              <p className="m-0 flex min-w-0 items-center gap-2 text-sm font-medium text-tertiary">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full bg-brand-solid"
                />
                {workspaceLabel ?? strings.ui.appShell.workspace}
              </p>
            </div>
            {utilitySlot && (
              <div className="flex shrink-0 items-center gap-3">
                {utilitySlot}
              </div>
            )}
          </div>
          {bannerSlot && (
            <div className="mx-auto max-w-352 px-4 pb-3 sm:px-6 lg:px-10">
              {bannerSlot}
            </div>
          )}
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto flex w-full min-w-0 max-w-352 flex-col gap-8 px-4 pt-6 pb-12 outline-none sm:px-6 lg:px-10 lg:pt-8 lg:pb-16"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
