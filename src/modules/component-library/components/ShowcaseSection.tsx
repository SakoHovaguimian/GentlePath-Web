import type { ReactNode } from 'react';
import { Card, IconTile, UiIcon, type IconName } from '@/components/ui';

// A documentation section: heading outside, specimens on one canvas.
export function ShowcaseSection({
  id,
  title,
  description,
  icon,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="grid min-w-0 scroll-mt-28 gap-4"
    >
      <div className="flex min-w-0 items-start gap-3">
        <IconTile size="sm">
          <UiIcon name={icon} className="size-4" />
        </IconTile>
        <div className="grid min-w-0 gap-0.5">
          <h2
            id={`${id}-title`}
            className="m-0 text-lg font-semibold text-primary"
          >
            {title}
          </h2>
          <p className="m-0 max-w-3xl text-sm text-secondary">{description}</p>
        </div>
      </div>
      <Card className="grid min-w-0 gap-8">{children}</Card>
    </section>
  );
}
