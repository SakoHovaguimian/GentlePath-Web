import type { ReactNode } from 'react';
import { Card } from './Card';
import { IconTile } from './IconTile';
import { cn } from '../lib/cn';

export function CardView({
  title,
  description,
  icon,
  trailing,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('grid gap-4 p-4 sm:p-4', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {icon && <IconTile>{icon}</IconTile>}
        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-sm font-semibold text-primary wrap-anywhere">
            {title}
          </h3>
          {description && (
            <p className="m-0 mt-1 text-xs text-tertiary wrap-anywhere">
              {description}
            </p>
          )}
        </div>
        {trailing}
      </div>
      {children}
    </Card>
  );
}
