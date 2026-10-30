import type { ReactNode, Ref } from 'react';
import type { BreadcrumbItem } from '../models/breadcrumbItem';
import { Breadcrumbs } from './Breadcrumbs';

// The single h1 for a page: location, title, supporting copy, facts, and actions.
export function PageHeader({
  title,
  description,
  descriptionAction,
  eyebrow,
  action,
  breadcrumbs,
  meta,
  headingRef,
  headingLevel = 'h1',
  onNavigate,
}: {
  title: string;
  description?: string;
  descriptionAction?: ReactNode;
  eyebrow?: string;
  action?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  meta?: ReactNode;
  headingRef?: Ref<HTMLHeadingElement>;
  headingLevel?: 'h1' | 'h2' | 'h3';
  onNavigate?: (href: string) => void;
}) {
  const Heading = headingLevel;
  return (
    <header className="ui-page-header @container grid min-w-0 gap-3">
      {breadcrumbs && breadcrumbs.length > 1 && (
        <Breadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
      )}
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="flex min-w-0 flex-1 basis-88 items-start gap-4">
          <div className="grid min-w-0 gap-1">
            {eyebrow && (
              <p className="m-0 text-xs font-semibold text-brand-secondary">
                {eyebrow}
              </p>
            )}
            <Heading
              ref={headingRef}
              tabIndex={headingRef ? -1 : undefined}
              className="m-0 font-display text-3xl font-normal tracking-tight text-primary wrap-anywhere focus:outline-none sm:text-4xl"
            >
              {title}
            </Heading>
            {description && (
              <p className="m-0 max-w-3xl text-sm text-secondary">
                {description}
              </p>
            )}
            {meta && (
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 pt-1 text-sm text-tertiary">
                {meta}
              </div>
            )}
          </div>
        </div>
        {(action || descriptionAction) && (
          <div className="ui-page-actions flex w-full flex-col items-stretch gap-3 @lg:w-auto @lg:flex-row @lg:flex-wrap @lg:items-center [&>.ui-button]:flex-none [&>.ui-button]:whitespace-nowrap">
            {descriptionAction}
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
