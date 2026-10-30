import type { ComponentPropsWithRef } from 'react';
import type { ButtonVariant } from './buttonVariant';

export type BookmarkButtonProps = ComponentPropsWithRef<'button'> & {
  saved?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
};
