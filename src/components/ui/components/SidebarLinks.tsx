'use client';

import { Fragment } from 'react';
import { NavigationLink } from './NavigationLink';
import type { NavigationPermission } from '../models/navigationPermission';
import type { AppSidebarItem } from '../models/sidebarItem';
import { cn } from '../lib/cn';

interface SidebarLinksProps {
  items: AppSidebarItem[];
  onNavigate?: (href: string) => void;
  onBeforeNavigate?: NavigationPermission;
}

export function SidebarLinks({
  items,
  onNavigate,
  onBeforeNavigate,
}: SidebarLinksProps) {
  return items.map((item) => (
    <Fragment key={item.href}>
      {item.sectionLabel && (
        <p className="ui-sidebar-section-label ui-sidebar-section-break">
          {item.sectionLabel}
        </p>
      )}
      <NavigationLink
        href={item.href}
        aria-current={item.active ? 'page' : undefined}
        beforeNavigate={onBeforeNavigate}
        navigate={onNavigate}
        className={cn(
          'ui-sidebar-link relative flex min-h-12 w-full cursor-pointer items-center justify-start rounded-lg px-4 py-3 text-left text-sm hover:bg-brand-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand',
          item.active
            ? 'font-semibold text-brand-secondary'
            : 'font-medium text-secondary',
          item.placement === 'bottom' && 'mt-auto',
        )}
      >
        <span className="relative z-10 flex min-w-0 items-center gap-3">
          <span className="ui-sidebar-icon inline-flex shrink-0 items-center justify-center">
            {item.icon}
          </span>
          <span className="min-w-0 text-left wrap-anywhere">{item.label}</span>
        </span>
      </NavigationLink>
    </Fragment>
  ));
}
