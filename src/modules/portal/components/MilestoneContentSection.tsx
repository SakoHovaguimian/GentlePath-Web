import type { ReactNode } from 'react';

export function MilestoneContentSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="gp-milestone-detail__section grid min-w-0 gap-5"
    >
      <div className="grid gap-2">
        <h2
          id={`${id}-heading`}
          className="m-0 font-display text-2xl font-normal text-primary"
        >
          {title}
        </h2>
        {description && (
          <p className="m-0 text-sm text-secondary">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
