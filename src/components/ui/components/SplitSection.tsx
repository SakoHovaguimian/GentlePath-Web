import type { ReactNode, Ref } from 'react';
import { Card } from './Card';
import { cn } from '../lib/cn';

// Settings-style row: the title column explains, the panel holds the fields.
// Columns respond to the section's own width, so it also works in narrow regions.
// Stack several inside SectionStack so dividers and spacing stay consistent.
export function SplitSection({
  id,
  title,
  description,
  action,
  headingRef,
  bare = false,
  children,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  headingRef?: Ref<HTMLHeadingElement>;
  bare?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="@container min-w-0">
      <div className="ui-split-section grid min-w-0 gap-4 @3xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] @3xl:gap-8 @5xl:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] @5xl:gap-10">
        <div className="grid min-w-0 content-start gap-1">
          <h2
            ref={headingRef}
            tabIndex={headingRef ? -1 : undefined}
            id={`${id}-title`}
            className="m-0 text-base font-semibold text-primary wrap-anywhere focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {title}
          </h2>
          {description && (
            <p className="m-0 text-sm text-secondary">{description}</p>
          )}
          {action && <div className="mt-3 flex flex-wrap gap-2">{action}</div>}
        </div>
        {bare ? (
          <div className={cn('grid min-w-0 gap-5', className)}>{children}</div>
        ) : (
          <Card className={cn('grid min-w-0 gap-5', className)}>
            {children}
          </Card>
        )}
      </div>
    </section>
  );
}

export function SectionStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'ui-section-stack grid min-w-0 gap-8 [&>*+*]:border-t [&>*+*]:border-secondary [&>*+*]:pt-8',
        className,
      )}
    >
      {children}
    </div>
  );
}
