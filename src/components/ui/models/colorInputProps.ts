import type { ComponentPropsWithoutRef } from 'react';

export type ColorInputProps = Pick<
  ComponentPropsWithoutRef<'button'>,
  'id' | 'disabled' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid'
> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
};
