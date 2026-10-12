import { cn } from './cn';
import type { ButtonVariant } from '../models/buttonVariant';

const buttonVariants = {
  primary:
    'bg-brand-solid ui-button-primary text-(--color-text-primary_on-brand) shadow-xs ring-1 ring-transparent ring-inset hover:bg-brand-solid_hover disabled:bg-disabled disabled:text-disabled disabled:ring-disabled_subtle',
  secondary:
    'bg-primary text-secondary shadow-none ring-1 ring-secondary ring-inset hover:bg-primary_hover hover:text-secondary_hover disabled:bg-disabled_subtle disabled:text-fg-disabled disabled:ring-disabled',
  destructive:
    'bg-error-primary text-error-primary ring-1 ring-error_subtle ring-inset hover:bg-error-secondary disabled:bg-disabled_subtle disabled:text-disabled disabled:ring-disabled_subtle',
  ghost:
    'bg-transparent text-secondary ring-1 ring-transparent hover:bg-secondary_subtle hover:text-primary disabled:text-fg-disabled',
} as const;

export function buttonClassName(
  variant: ButtonVariant = 'primary',
  className?: string,
) {
  return cn(
    'ui-button group relative isolate inline-flex min-h-11 h-max cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed',
    buttonVariants[variant],
    className,
  );
}
