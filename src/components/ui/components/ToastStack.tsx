import type { CSSProperties } from 'react';
import { cn } from '../lib/cn';
import { Message } from './Message';
import { IosPushNotification } from './IosPushNotification';
import { Button } from './Button';

import type { ToastItem } from '../models/toastItem';
import type { ToastPosition } from '../models/toastPosition';
export type { ToastItem } from '../models/toastItem';
export type { ToastIntent } from '../models/toastIntent';
export type { ToastPosition } from '../models/toastPosition';

const positions: Record<ToastPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
};

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <>
      {(Object.keys(positions) as ToastPosition[]).map((position) => {
        const items = toasts.filter((toast) => toast.position === position);
        return items.length ? (
          <div
            key={position}
            className={cn(
              'pointer-events-none fixed z-120 grid max-h-[calc(100dvh-2rem)] w-[min(92vw,26rem)] gap-3 overflow-y-auto',
              positions[position],
            )}
          >
            {items.map((toast) => (
              <div
                key={toast.id}
                data-position={position}
                data-exiting={toast.exiting || undefined}
                data-motion={toast.motionEnabled === false ? 'off' : undefined}
                className={cn(
                  'ui-toast pointer-events-auto',
                  toast.appearance !== 'ios-push' &&
                    'rounded-lg bg-primary shadow-(--dashboard-shell-shadow-lg)',
                )}
                style={
                  toast.motionEnabled === false
                    ? undefined
                    : ({
                        '--ui-overlay-duration': `${toast.motionDurationMs ?? 220}ms`,
                      } as CSSProperties)
                }
              >
                {toast.appearance === 'ios-push' ? (
                  <IosPushNotification
                    title={toast.title}
                    body={toast.description}
                    onDismiss={() => onDismiss(toast.id)}
                  />
                ) : (
                  <Message
                    title={toast.title}
                    description={toast.description}
                    intent={toast.intent}
                    className={
                      !toast.description
                        ? 'items-center py-2 [&>svg]:mt-0'
                        : undefined
                    }
                    onDismiss={() => onDismiss(toast.id)}
                  />
                )}
                {(toast.meta || (toast.actionLabel && toast.onAction)) && (
                  <div className="flex flex-wrap items-center gap-2 p-3 pt-0">
                    {toast.meta && (
                      <span className="text-xs text-secondary">
                        {toast.meta}
                      </span>
                    )}
                    {toast.actionLabel && toast.onAction && (
                      <Button
                        variant="ghost"
                        onClick={() => void toast.onAction?.()}
                      >
                        {toast.actionLabel}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null;
      })}
    </>
  );
}
