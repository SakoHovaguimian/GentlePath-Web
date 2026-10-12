import type { ReactNode } from 'react';
import type { ToastIntent } from './toastIntent';
import type { ToastPosition } from './toastPosition';

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  appearance?: 'standard' | 'ios-push';
  intent: ToastIntent;
  position: ToastPosition;
  exiting?: boolean;
  motionEnabled?: boolean;
  motionDurationMs?: number;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  meta?: ReactNode;
};
