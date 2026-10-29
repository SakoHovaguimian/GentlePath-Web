'use client';

import type { ReactNode } from 'react';
import { strings } from '@/strings';
import { Button } from '../components/Button';
import { InitialsAvatar } from '../components/InitialsAvatar';
import { SidebarLinks } from '../components/SidebarLinks';
import { cn } from '../lib/cn';
import type { AppSidebarProps } from '../models/appSidebarProps';

export function AppSidebarContent({
  session,
  items,
  onNavigate,
  accountSlot,
  activePath,
  contextSlot,
  headerAction,
  brandSlot,
  navigationLabel,
  supportSlot,
}: AppSidebarProps & { headerAction?: ReactNode }) {
  const homeHref = '/dashboard';
  const displayName =
    `${session.user.firstName} ${session.user.lastName}`.trim();
  return (
    <div className="ui-sidebar-content flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-stretch gap-6 pt-8 pb-4">
        <div
          className={cn(
            'ui-sidebar-brand flex shrink-0 items-center justify-between gap-3 px-6',
            headerAction && 'sticky top-0 z-10',
          )}
        >
          <a
            href={homeHref}
            className="inline-flex min-h-11 cursor-pointer items-center font-display text-2xl font-semibold tracking-tight text-brand-secondary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
            onClick={
              onNavigate
                ? (event) => {
                    if (
                      event.button !== 0 ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    )
                      return;
                    event.preventDefault();
                    onNavigate(homeHref);
                  }
                : undefined
            }
          >
            {brandSlot ?? strings.app.name}
          </a>
          {headerAction}
        </div>
        <nav
          aria-label={strings.ui.appShell.navigation}
          className="ui-sidebar-navigation mx-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1 pb-1"
        >
          {navigationLabel && (
            <p className="ui-sidebar-section-label">{navigationLabel}</p>
          )}
          <SidebarLinks items={items} onNavigate={onNavigate} />
          {contextSlot && <div className="w-full min-w-0">{contextSlot}</div>}
        </nav>
        {supportSlot && (
          <div className="ui-sidebar-support mx-4 shrink-0">{supportSlot}</div>
        )}
      </div>
      <div className="ui-sidebar-account mt-auto shrink-0 px-5 pt-3 pb-5">
        <Button
          variant="ghost"
          className="ui-sidebar-profile -mx-2 h-auto w-[calc(100%+1rem)] min-w-0 justify-start px-2 py-2 text-left whitespace-nowrap"
          aria-label={strings.designSystem.profileLink}
          aria-current={activePath === '/profile' ? 'page' : undefined}
          onClick={() =>
            onNavigate
              ? onNavigate('/profile')
              : window.location.assign('/profile')
          }
        >
          <InitialsAvatar name={displayName} />
          <span className="grid min-w-0 flex-1 gap-0.5">
            <span
              className="block min-w-0 truncate text-sm font-semibold text-primary"
              title={displayName}
            >
              {displayName}
            </span>
            <span
              className="block min-w-0 truncate text-xs text-secondary"
              title={session.user.email}
            >
              {session.user.email}
            </span>
          </span>
        </Button>
        {accountSlot && <div className="mt-3">{accountSlot}</div>}
      </div>
    </div>
  );
}
