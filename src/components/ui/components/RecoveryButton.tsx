'use client';

import type { ComponentProps } from 'react';
import { strings } from '@/strings';
import { Button } from './Button';

// Saved-state recovery is available after a failure, without a routine reload action.
export function RecoveryButton({
  needed,
  ...props
}: Omit<ComponentProps<typeof Button>, 'children' | 'asChild'> & {
  needed: boolean;
}) {
  if (!needed) return null;
  return <Button {...props}>{strings.ui.states.retry}</Button>;
}
