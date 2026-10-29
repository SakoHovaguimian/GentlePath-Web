import type { ComponentProps } from 'react';
import type { Button } from '../components/Button';

export type ReactionButtonProps = Omit<
  ComponentProps<typeof Button>,
  'asChild' | 'children' | 'variant' | 'aria-pressed'
> & {
  liked: boolean;
  label: string;
  count?: number;
  countLabel?: string;
};
