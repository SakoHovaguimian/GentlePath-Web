import {
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { Button } from './Button';
import { IconTile } from './IconTile';
import { UiIcon } from './UiIcon';
import { cn } from '../lib/cn';

// A single interactive surface. Use asChild with a link for navigation.
export function SectionCardView({
  title,
  description,
  icon,
  accent = false,
  trailing,
  metadata,
  className,
  children,
  asChild,
  ...props
}: Omit<ComponentProps<typeof Button>, 'title'> & {
  title: string;
  description?: string;
  icon: ReactNode;
  accent?: boolean;
  trailing?: ReactNode;
  metadata?: ReactNode;
}) {
  const content = (
    <>
      <IconTile
        className={
          accent ? 'border border-secondary bg-primary shadow-xs' : undefined
        }
      >
        {icon}
      </IconTile>
      <span className="relative min-w-0 flex-1 text-left">
        <span className="block text-sm font-semibold text-primary wrap-anywhere">
          {title}
        </span>
        {description && (
          <span className="mt-1 block text-xs font-normal text-secondary wrap-anywhere">
            {description}
          </span>
        )}
        {metadata && (
          <span className="mt-2 block text-xs font-normal text-tertiary">
            {metadata}
          </span>
        )}
      </span>
      {trailing && <span className="shrink-0">{trailing}</span>}
      <UiIcon
        name="chevronRight"
        className="ui-section-chevron relative size-4 text-secondary"
      />
    </>
  );
  // Slot composes the content into the caller's anchor without a nested button.
  return (
    <Button
      variant="ghost"
      asChild={asChild}
      className={cn(
        'ui-section-card relative w-full justify-start overflow-hidden rounded-xl border border-secondary bg-primary p-4 text-left shadow-xs hover:border-brand/40 hover:bg-brand-primary',
        accent && 'ui-section-accent min-h-28 border-brand/20',
        className,
      )}
      {...props}
    >
      {asChild && isValidElement<{ children?: ReactNode }>(children)
        ? cloneElement(children, undefined, content)
        : content}
    </Button>
  );
}
