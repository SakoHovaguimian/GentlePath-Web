'use client';

import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { strings } from '@/strings';
import { IconButton } from './IconButton';
import { UiIcon } from './UiIcon';

export function FloatingAssistantDialog({
  open,
  title,
  description,
  busy = false,
  onClose,
  onReturnFocus,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  busy?: boolean;
  onClose: () => void;
  onReturnFocus: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="ui-backdrop fixed inset-0 z-[80] bg-[var(--dashboard-shell-overlay)] backdrop-blur-sm" />
        <Dialog.Content
          data-side="right"
          className="ui-sheet fixed inset-x-0 bottom-0 z-[90] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-2xl border border-secondary bg-primary shadow-[var(--dashboard-shell-shadow-lg)] outline-none sm:inset-x-auto sm:inset-y-0 sm:end-0 sm:w-[min(92vw,40rem)] sm:max-h-dvh sm:rounded-none sm:rounded-s-2xl"
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (busy) event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onReturnFocus();
          }}
        >
          <div className="flex shrink-0 items-start gap-4 border-b border-secondary p-5 sm:p-6">
            <UiIcon
              name="sparkles"
              className="mt-1 size-6 text-brand-secondary"
            />
            <div className="min-w-0 flex-1">
              <Dialog.Title className="m-0 text-xl font-semibold text-primary">
                {title}
              </Dialog.Title>
              <Dialog.Description className="m-0 mt-2 text-sm text-secondary">
                {description}
              </Dialog.Description>
            </div>
            <IconButton
              label={strings.floatingAssistant.close}
              variant="ghost"
              disabled={busy}
              onClick={onClose}
            >
              <UiIcon name="close" />
            </IconButton>
          </div>
          <div className="ui-assistant-content grid min-h-0 content-start gap-5 overflow-y-auto p-5 sm:p-6">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
