import type { AriaAttributes, ReactNode, Ref } from 'react';
import type { ButtonProps } from 'react-aria-components';

export type SelectProps = Omit<
  ButtonProps,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'children'
  | 'className'
  | 'isDisabled'
> & {
  ref?: Ref<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
  'aria-invalid'?: AriaAttributes['aria-invalid'];
  children: ReactNode;
  leadingIcon?: ReactNode;
  value?: string | number;
  defaultValue?: string | number;
  onValueChange?: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  required?: boolean;
  autoComplete?: string;
};
