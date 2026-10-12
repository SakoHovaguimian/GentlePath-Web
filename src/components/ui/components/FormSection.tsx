import type { ReactNode, Ref } from 'react';
import { IconTile } from './IconTile';
import { cn } from '../lib/cn';

export function FormSection({
  id,
  title,
  description,
  icon,
  action,
  headingRef,
  headingLevel = 3,
  children,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  headingRef?: Ref<HTMLHeadingElement>;
  headingLevel?: 2 | 3;
  children: ReactNode;
  className?: string;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn('grid min-w-0 gap-4', className)}
    >
      <div className="flex flex-wrap items-start gap-3">
        {icon && <IconTile size="sm">{icon}</IconTile>}
        <div className="min-w-0 flex-1 basis-56">
          <Heading
            ref={headingRef}
            tabIndex={headingRef ? -1 : undefined}
            id={`${id}-title`}
            className="m-0 text-base font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {title}
          </Heading>
          {description && (
            <p className="m-0 mt-0.5 max-w-prose text-sm text-secondary">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex shrink-0 flex-wrap gap-2">{action}</div>
        )}
      </div>
      {children}
    </section>
  );
}
