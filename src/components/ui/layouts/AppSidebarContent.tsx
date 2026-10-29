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
}: AppSidebarProps & { headerAction?: ReactNode }) {
  const homeHref = '/dashboard';
  const displayName =
    `${session.user.firstName} ${session.user.lastName}`.trim();
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col items-stretch gap-8 pt-10 pb-6">
        <div
          className={cn(
            'flex items-center justify-between gap-3 px-8',
            headerAction &&
              'sticky top-0 z-10 bg-(--dashboard-shell-panel-solid)',
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
          className="mx-4 flex flex-1 flex-col gap-2"
        >
          <SidebarLinks items={items} onNavigate={onNavigate} />
          {contextSlot && <div className="w-full min-w-0">{contextSlot}</div>}
        </nav>
      </div>
      <div className="mt-auto border-t border-secondary px-8 pt-3 pb-6">
        <Button
          variant="ghost"
          className="-mx-4 h-auto w-[calc(100%+2rem)] min-w-0 justify-start px-4 py-3 text-left whitespace-nowrap"
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
