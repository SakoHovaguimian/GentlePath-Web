import type { ReactNode } from 'react';
import type { PresentationMotionOverride } from './presentationMotionOverride';
import type { ToastIntent, ToastPosition } from '@/components/ui';
export type ToastPresentation = {
  kind: 'toast';
  title: string;
  description?: string;
  appearance?: 'standard' | 'ios-push';
  intent?: ToastIntent;
  position?: ToastPosition;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  meta?: ReactNode;
  motion?: PresentationMotionOverride;
};
