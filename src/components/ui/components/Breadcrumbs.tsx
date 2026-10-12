'use client';

import type { MouseEvent } from 'react';
import { strings } from '@/strings';
import type { BreadcrumbItem } from '../models/breadcrumbItem';
import { UiIcon } from './UiIcon';

// Plain primary clicks hand the destination to the caller's guarded router;
// modified clicks keep native link behavior.
function guardedClick(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  onNavigate?: (href: string) => void,
) {
  if (
    !onNavigate ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  event.preventDefault();
  onNavigate(href);
}

export function Breadcrumbs({
  items,
  onNavigate,
}: {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}) {
  return (
    <nav aria-label={strings.pageLayout.breadcrumbs} className="min-w-0">
      <ol className="m-0 flex min-w-0 list-none flex-wrap items-center gap-x-1 gap-y-1 p-0 text-sm">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li
              key={`${index}:${item.label}`}
              className="flex min-w-0 items-center gap-1"
            >
              {index > 0 && (
                <UiIcon
                  name="chevronRight"
                  className="size-4 text-quaternary"
                />
              )}
              {item.href && !current ? (
                <a
                  href={item.href}
                  onClick={(event) =>
                    guardedClick(event, item.href!, onNavigate)
                  }
                  className="ui-breadcrumb-link max-w-72 truncate rounded-md px-1 py-0.5 font-medium text-tertiary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={current ? 'page' : undefined}
                  className="max-w-96 truncate px-1 py-0.5 font-medium text-secondary"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
