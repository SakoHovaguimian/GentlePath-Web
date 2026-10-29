import type { ReactNode, Ref } from 'react';
import { cn } from '../lib/cn';

// A titled page region (h2). Content decides whether it sits on a Card.
export function PageSection({
  id,
  title,
  description,
  action,
  actionAlignment = 'end',
  headingRef,
  children,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  actionAlignment?: 'end' | 'center';
  headingRef?: Ref<HTMLHeadingElement>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn(
        'ui-page-section grid min-w-0 content-start gap-4',
        className,
      )}
    >
      <div
        className={cn(
          'flex min-w-0 flex-wrap justify-between gap-x-6 gap-y-3',
          actionAlignment === 'center' ? 'items-center' : 'items-end',
        )}
      >
        <div className="grid min-w-0 flex-1 basis-64 gap-1">
          <h2
            ref={headingRef}
            tabIndex={headingRef ? -1 : undefined}
            id={`${id}-title`}
            className="m-0 font-display text-xl font-normal tracking-tight text-primary wrap-anywhere focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-2xl"
          >
            {title}
          </h2>
          {description && (
            <p className="m-0 max-w-3xl text-sm text-secondary">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div
            className={cn(
              'flex flex-wrap items-center gap-2',
              actionAlignment === 'center' && 'ms-auto',
            )}
          >
            {action}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}
