import type { ComponentPropsWithRef, ReactNode } from 'react';

export type TextAreaProps = ComponentPropsWithRef<'textarea'> & {
  leadingIcon?: ReactNode;
  autoGrow?: boolean;
};
