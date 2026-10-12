'use client';

import { labels, strings } from '@/strings';
import * as Dialog from '@radix-ui/react-dialog';
import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Button } from './Button';
import { cn } from '../lib/cn';
import type { AlertTone } from './AlertModal';

export type SheetTone = AlertTone;
export type SheetSide = 'left' | 'right' | 'bottom';
export type SheetSize = 'sm' | 'md' | 'lg';

const toneClasses: Record<SheetTone, string> = {
  neutral: 'border-secondary',
  info: 'border-brand-secondary/60',
  success: 'border-success-secondary/70',
  warning: 'border-warning-secondary/70',
  danger: 'border-error-secondary/70',
};

const accentClasses: Record<SheetTone, string> = {
  neutral: 'bg-secondary_subtle text-primary',
  info: 'bg-brand-primary/20 text-brand-secondary',
  success: 'bg-success-secondary/25 text-success-primary',
  warning: 'bg-warning-secondary/35 text-warning-primary',
  danger: 'bg-error-secondary/25 text-error-primary',
};

const sideClasses: Record<SheetSide, string> = {
  left: 'left-0 top-0 h-dvh rounded-none rounded-r-2xl',
  right: 'right-0 top-0 h-dvh rounded-none rounded-l-2xl',
  bottom:
    'bottom-0 left-1/2 w-[min(96vw,72rem)] -translate-x-1/2 rounded-t-2xl rounded-b-none',
};

const sizeClasses: Record<SheetSide, Record<SheetSize, string>> = {
  left: {
    sm: 'w-[min(92vw,24rem)]',
    md: 'w-[min(92vw,32rem)]',
    lg: 'w-[min(94vw,40rem)]',
  },
  right: {
    sm: 'w-[min(92vw,24rem)]',
    md: 'w-[min(92vw,32rem)]',
    lg: 'w-[min(94vw,40rem)]',
  },
  bottom: {
    sm: 'min-h-[min(18rem,92dvh)]',
    md: 'min-h-[min(24rem,92dvh)]',
    lg: 'min-h-[min(32rem,92dvh)]',
  },
};

export function SheetPanel({
  open,
  title,
  description,
  tone = 'neutral',
  side = 'right',
  size = 'md',
  confirmLabel = strings.ui.sheetPanel.continue,
  cancelLabel = strings.ui.sheetPanel.close,
  onCancel,
  onConfirm,
  details,
  content,
  motionEnabled = true,
  motionDurationMs = 260,
}: {
  open: boolean;
  title: string;
  description?: string;
  tone?: SheetTone;
  side?: SheetSide;
  size?: SheetSize;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  details?: ReactNode;
  content?: ReactNode;
  motionEnabled?: boolean;
  motionDurationMs?: number;
}) {
  const returnFocusRef = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => (!nextOpen ? onCancel() : undefined)}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          data-motion={motionEnabled ? undefined : 'off'}
          className={cn(
            'ui-backdrop fixed inset-0 z-[80] bg-[var(--dashboard-shell-overlay)] backdrop-blur-sm',
          )}
          style={
            motionEnabled
              ? ({
                  '--ui-overlay-duration': `${motionDurationMs}ms`,
                } as CSSProperties)
              : undefined
          }
        />
        <Dialog.Content
          data-side={side}
          data-motion={motionEnabled ? undefined : 'off'}
          {...(!description ? { 'aria-describedby': undefined } : {})}
          onOpenAutoFocus={() => {
            returnFocusRef.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (returnFocusRef.current?.isConnected) {
              returnFocusRef.current.focus();
            }
          }}
          className={cn(
            'ui-sheet fixed z-[90] flex max-h-dvh overflow-y-auto border bg-primary shadow-[var(--dashboard-shell-shadow-lg)] outline-none',
            toneClasses[tone],
            sideClasses[side],
            sizeClasses[side][size],
          )}
          style={
            motionEnabled
              ? ({
                  '--ui-overlay-duration': `${motionDurationMs}ms`,
                } as CSSProperties)
              : undefined
          }
        >
          <div className="flex h-full w-full flex-col gap-5 p-6">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em]',
                  accentClasses[tone],
                )}
              >
                <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                {labels.sides[side]}
              </div>
              <div className="min-w-0 flex-1">
                <Dialog.Title className="font-display text-2xl font-semibold tracking-tight text-primary">
                  {title}
                </Dialog.Title>
                {description ? (
                  <Dialog.Description className="mt-2 text-sm leading-6 text-secondary">
                    {description}
                  </Dialog.Description>
                ) : null}
              </div>
            </div>

            {details ? (
              <div className="rounded-xl border border-secondary bg-secondary_subtle p-4 text-sm text-secondary">
                {details}
              </div>
            ) : null}

            {content ? (
              <div className="min-h-0 flex-1 overflow-auto">{content}</div>
            ) : null}

            <div className="mt-auto flex flex-wrap justify-end gap-3 border-t border-secondary pt-5">
              <Button variant="secondary" onClick={onCancel}>
                {cancelLabel}
              </Button>
              <Button
                variant={tone === 'danger' ? 'destructive' : 'primary'}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
